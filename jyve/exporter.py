import subprocess
import time
import os
import shutil
import binascii
import json
import re
import notebook
from shutil import copytree, rmtree, copy2

from pathlib import Path

from tornado.httpclient import HTTPClient

import nbformat
from ipython_genutils.tempdir import TemporaryDirectory

import traitlets as T

from nbconvert.filters.highlight import Highlight2HTML
from nbconvert.exporters import HTMLExporter

import jupyterlab


class JyveExporter(HTMLExporter):
    """ Export a single notebook as a snapshot of a working JupyterLab
        environment
    """
    port = T.Integer(9999, help="port for temporary server")
    token = T.Unicode(
        binascii.b2a_hex(os.urandom(15)).decode("utf-8"), help="temporary token"
    )
    extra_urls = T.List(
        [
            "favicon.ico",
            "api/contents/",
            "lab/api/settings/@jupyterlab/apputils-extension:themes",
            "lab/api/settings/@jupyterlab/codemirror-extension:commands",
            "lab/api/settings/@jupyterlab/docmanager-extension:plugin",
            "lab/api/settings/@jupyterlab/fileeditor-extension:plugin",
            "lab/api/settings/@jupyterlab/notebook-extension:tracker",
            "lab/api/settings/@jupyterlab/shortcuts-extension:plugin",
        ],
        help="additional notebook urls to cache",
        config=True,
    )

    extra_notebooks = T.List([], help="additional notebooks to load", config=True)

    extra_contents = T.List([], help="additional contents to include ", config=True)

    dummy_apis = T.Dict(
        {
            "api/sessions": [],
            "api/terminals": [],
            "api/kernelspecs": {
                "default": "python3",
                "kernelspecs": {
                    "python3": {
                        "name": "python3",
                        "spec": {
                            "argv": ["echo", "jyve"],
                            "env": {},
                            "display_name": "Python 3",
                            "language": "python",
                            "interrupt_mode": "signal",
                            "metadata": {},
                        },
                        "resources": {
                            "logo-64x64": "/kernelspecs/python3/logo-64x64.png",
                            "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
                        },
                    }
                },
            },
            "lab/api/build": {"status": "stable", "message": "have fun!"},
        },
        help="easier than coding around it",
    )

    jupyter_config_data = T.Dict(
        {
            "buildAvailable": "False",
            "buildCheck": "False",
            "token": "",
            "devMode": "False",
            "terminalsAvailable": "False",
            "ignorePlugins": "[]",
            "serverRoot": "~/jyve",
            "mathjaxConfig": "TeX-AMS-MML_HTMLorMML-full,Safe",
            "mathjaxUrl": "../static/components/MathJax/MathJax.js",
            "appName": "JupyterLab Beta",
            "appNamespace": "jupyterlab",
            "appSettingsDir": "~/jyve/settings",
            "appVersion": jupyterlab.__version__,
            "cacheFiles": "True",
            "pageUrl": "./lab",
            "publicUrl": "../lab/static/",
            "schemasDir": "~/jyve/schemas/",
            "settingsUrl": "../lab/api/settings/",
            "staticDir": "~/jyve/static",
            "templatesDir": "~/jyve/templates",
            "themesDir": "~/jyve/themes/",
            "themesUrl": "../lab/api/themes/",
            "treeUrl": "../lab/tree/",
            "userSettingsDir": "~/jyve/lab/user-settings",
            "workspacesDir": "~/jyve/lab/workspaces",
            "workspacesUrl": "../lab/workspaces/",
            "baseUrl": "../",
            "wsUrl": "",
            "jyveOffline": True,
        },
        help="some reasonable fake values",
    )

    @property
    def extra_files(self):
        here = Path(".")
        for nb in self.extra_notebooks:
            yield here / nb
        for pattern in self.extra_contents:
            for match in here.glob(pattern):
                yield match

    def from_file(self, file_path, resources=None):
        self._ipynb_file = file_path.name
        return super(JyveExporter, self).from_file(file_path, resources)

    def from_notebook_node(self, nb, resources=None, **kw):
        if not hasattr(self, "_ipynb_file"):
            self._ipynb_file = None
        url_root = "http://{}".format("localhost:{}".format(self.port))
        output_root = Path(resources["output_files_dir"])
        lab_path = self.lab_path()
        static_path = Path(notebook.__file__).parent / "static"
        nb_names = [resources["metadata"]["name"]] + [
            str(ef)[:-6] for ef in self.extra_files if ef.name.endswith(".ipynb")
        ]

        urls = ["lab"] + [
            "api/contents/{}.ipynb".format(nb_name) for nb_name in nb_names
        ] + [
            "api/contents/{}".format(ef)
            for ef in self.extra_files
            if not ef.name.endswith(".ipynb")
        ] + self.extra_urls

        with TemporaryDirectory() as tmpdir:
            urls += list(self.prepare_contents(tmpdir))
            urls += list(self.prepare_notebooks(tmpdir, nb, nb_names))
            self.fetch_all(tmpdir, url_root, urls, resources)

        self.copy_assets(output_root, lab_path, static_path)
        self.fix_urls(output_root, nb_names)
        self.fake_apis(output_root)
        self.fake_home(output_root)

        langinfo = nb.metadata.get("language_info", {})
        lexer = langinfo.get("pygments_lexer", langinfo.get("name", None))
        self.register_filter(
            "highlight_code", Highlight2HTML(pygments_lexer=lexer, parent=self)
        )

        return super(HTMLExporter, self).from_notebook_node(nb, resources, **kw)

    def prepare_notebooks(self, tmpdir, nb, nb_names):
        td = Path(tmpdir)
        for i, nb_name in enumerate(nb_names):
            nb_path = td / "{}.ipynb".format(nb_name)
            if i == 0:
                # just handle the first one
                yield from self.ensure_parent(tmpdir, nb_path)
                nb_path.write_text(nbformat.writes(nb, 4))
            else:
                yield from self.ensure_parent(tmpdir, nb_path)
                copy2("{}.ipynb".format(nb_name), str(nb_path))

    def prepare_contents(self, tmpdir):
        td = Path(tmpdir)
        for ef in self.extra_files:
            ef_path = td / ef
            if ef.name.endswith(".ipynb"):
                continue
            yield from self.ensure_parent(tmpdir, ef)
            copy2(ef, str(ef_path))

    def ensure_parent(self, tmpdir, path):
        parent = path.parent
        if not parent.exists():
            yield "api/contents/{}".format(parent.relative_to(tmpdir))
            parent.mkdir()

    def fetch_all(self, tmpdir, url_root, urls, resources):
        lab = self.start_lab(url_root, tmpdir)
        for url in urls:
            self.fetch_one(url_root, url, resources)
        lab.kill()

    def lab_path(self):
        return Path(
            subprocess.check_output(["jupyter-lab", "paths"]).decode("utf-8").split(
                "\n"
            )[
                0
            ].split(
                " directory: "
            )[
                1
            ].strip()
        )

    def lab_args(self):
        return [
            "jupyter-lab",
            "--no-browser",
            "--NotebookApp.token='{}'".format(self.token),
            "--NotebookApp.password=''",
            "--port={}".format(self.port),
        ]

    def start_lab(self, url_root, cwd):
        # start a lab server
        lab = subprocess.Popen(self.lab_args(), cwd=cwd)
        timeout = 10

        while timeout:
            try:
                HTTPClient().fetch(
                    "{}?token={}".format(url_root, self.token), method="GET"
                )
                return lab
            except Exception:
                timeout -= 1
                time.sleep(0.5)

    def fetch_one(self, url_root, url, resources):
        mirror_args = [
            "wget",
            "--page-requisites",
            "--convert-links",
            "-nH",
            "-e",
            "robots=off",
            "-P",
            resources["output_files_dir"],
            "{}/{}?token={}".format(url_root, url, self.token),
        ]
        # scrape the hell out of it
        mirror = subprocess.Popen(mirror_args)
        mirror.wait()

    def copy_assets(self, output_root, lab_path, static_path):
        out_static = output_root / "lab" / "static"
        lab_static = lab_path / "static"
        if out_static.exists():
            rmtree(out_static)
        copytree(str(lab_static), str(out_static))

        themes_out = output_root / "lab" / "api" / "themes"
        if themes_out.exists():
            rmtree(str(out_static))
        copytree(str(lab_path / "themes"), str(themes_out))

        for urls in themes_out.rglob("urls.css"):
            css = urls.read_text()
            url_frag = urls.parent.relative_to(output_root)
            css = re.sub(
                r"""(url\(['"])(images|icons)""", r"\1../{}/\2".format(url_frag), css
            )
            urls.write_text(css)

        # grab some stuff from notebook
        components = output_root / "static" / "components"
        if components.exists():
            rmtree(components)
        components.mkdir(exist_ok=True)
        copytree(
            str(static_path / "components" / "MathJax"), str(components / "MathJax")
        )

        [jsmap.unlink() for jsmap in output_root.rglob("*.js.map")]
        [jsmap.unlink() for jsmap in output_root.rglob("stats.json")]

    def fix_index(self, output_root):
        index = output_root / "lab" / "index.html"
        if index.exists():
            index.unlink()

        list(output_root.glob("lab*token*"))[0].rename(index)

        new_idx = re.sub(
            '(<script.*?id="jupyter-config-data".*?>).*?(</script>)',
            "\\1\n{}\n</script>".format(json.dumps(self.jupyter_config_data, indent=2)),
            index.read_text(),
            flags=re.M | re.S,
        )

        new_idx = re.sub(r'src="lab', 'src="../lab', new_idx)

        index.write_text(new_idx)

    def fix_urls(self, output_root, nb_names):
        self.fix_index(output_root)

        # handle the rest
        [
            shutil.move(str(t), str(t.parent / t.name.split("?")[0]))
            for t in output_root.rglob("*?token={}".format(self.token))
        ]

        self.fix_contents(output_root, nb_names)

    def fix_contents(self, output_root, nb_names):
        parents = set()
        contents_root = output_root / "api" / "contents"

        for nb_name in nb_names:
            parents = parents | set(
                (contents_root / nb_name).relative_to(contents_root).parents
            )

        for parent in [p for p in parents if p != Path(".")]:
            parent_path = contents_root / parent
            contents = (parent_path / parent.name).read_text()
            (parent_path / parent.name).unlink()
            (parent_path / "index.html").write_text(contents)

        for nb_name in nb_names:
            nb_file = "{}.ipynb".format(nb_name)
            ipynb = contents_root / nb_file
            contents = ipynb.read_text()
            ipynb.unlink()
            ipynb.mkdir()
            (ipynb / "index.html").write_text(contents)
            (ipynb / "checkpoints").write_text("[]")

    def fake_apis(self, output_root):
        api_root = output_root / "api"
        api_root.mkdir(exist_ok=True)

        for path, response in self.dummy_apis.items():
            the_json = json.dumps(response)
            if path.endswith("/"):
                (output_root / path).mkdir(exist_ok=True)
                out_path = output_root / path / "index.html"
            else:
                out_path = output_root / path
            out_path.write_text(the_json)

    def fake_home(self, output_root):
        index = Path(output_root) / "index.html"
        index.write_text(
            """<!DOCTYPE html>\n"""
            """<meta http-equiv="refresh" content="0; URL=./lab" />"""
        )
