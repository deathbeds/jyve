import subprocess
import time
import os
from os.path import join, exists
import shutil
from glob import glob
import binascii
import json
import re

from pathlib import Path

from tornado.httpclient import HTTPClient

import nbformat
from ipython_genutils.tempdir import TemporaryDirectory

import traitlets as T

from nbconvert.filters.highlight import Highlight2HTML
from nbconvert.exporters import HTMLExporter


class JyveExporter(HTMLExporter):
    """ Export a single notebook as a snapshot of a working JupyterLab
        environment
    """
    port = T.Integer(9999, help="port for temporary server")
    token = T.Unicode(binascii.b2a_hex(os.urandom(15)).decode('utf-8'),
                      help="temporary token")
    extra_urls = T.List(
        [
            "api/contents/",
            "lab/api/settings/@jupyterlab/apputils-extension:themes",
            "lab/api/settings/@jupyterlab/codemirror-extension:commands",
            "lab/api/settings/@jupyterlab/docmanager-extension:plugin",
            "lab/api/settings/@jupyterlab/fileeditor-extension:plugin",
            "lab/api/settings/@jupyterlab/notebook-extension:tracker",
            "lab/api/settings/@jupyterlab/shortcuts-extension:plugin",
        ],
        help="additional notebook urls to cache",
        config=True)

    extra_notebooks = T.List(
        [],
        help="additional notebooks to load",
        config=True)

    dummy_apis = T.Dict({
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
                        "metadata": {}
                    },
                    "resources": {
                        "logo-64x64": "/kernelspecs/python3/logo-64x64.png",
                        "logo-32x32": "/kernelspecs/python3/logo-32x32.png"}}}
                        },
        "lab/api/build": {"status": "stable", "message": "have fun!"},
    }, help="easier than coding around it")

    jupyter_config_data = T.Dict({
        "buildAvailable": "False",
        "buildCheck": "False",
        "token": "nope",
        "devMode": "False",
        "terminalsAvailable": "False",
        "ignorePlugins": "[]",
        "serverRoot": "~/jyve",
        "mathjaxConfig": "TeX-AMS-MML_HTMLorMML-full,Safe",
        "mathjaxUrl": "../static/components/MathJax/MathJax.js",
        "appName": "JupyterLab Beta",
        "appNamespace": "jupyterlab",
        "appSettingsDir": "~/jyve/settings",
        "appVersion": "0.31.8",
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
        "wsUrl": ""
    }, help="some reasonable fake values")

    def from_notebook_node(self, nb, resources=None, **kw):
        local_host = "localhost:{}".format(self.port)
        url_root = "http://{}".format(local_host)
        output_root = join(resources["output_files_dir"], local_host)
        lab_path = self.lab_path()
        nb_names = [resources["metadata"]["name"]] + self.extra_notebooks

        urls = [
            "lab"
        ] + [
            "api/contents/{}.ipynb".format(nb_name)
            for nb_name in nb_names
        ] + self.extra_urls

        with TemporaryDirectory() as tmpdir:
            for i, nb_name in enumerate(nb_names):
                nb_path = join(tmpdir, "{}.ipynb".format(nb_name))
                if not i:
                    with open(nb_path, "w+") as fp:
                        nbformat.write(nb, fp, 4)
                else:
                    parent = Path(nb_path).parent
                    if not exists(parent):
                        urls += ["api/contents/{}".format(
                            parent.relative_to(tmpdir)
                        )]
                    Path(nb_path).parent.mkdir(exist_ok=True)
                    shutil.copy2(
                        "{}.ipynb".format(nb_name),
                        nb_path
                    )

            lab = self.start_lab(url_root, tmpdir)
            __import__("pprint").pprint(urls)
            for url in urls:
                self.fetch_one(url_root, url, resources)

            lab.kill()

        self.copy_assets(output_root, lab_path)
        self.fix_urls(output_root, nb_names)
        self.fake_apis(output_root)

        langinfo = nb.metadata.get('language_info', {})
        lexer = langinfo.get('pygments_lexer', langinfo.get('name', None))
        self.register_filter('highlight_code',
                             Highlight2HTML(pygments_lexer=lexer, parent=self))

        return super(HTMLExporter, self).from_notebook_node(
            nb, resources, **kw)

    def lab_path(self):
        return (subprocess.check_output(["jupyter-lab", "paths"])
                .decode("utf-8")
                .split("\n")[0]
                .split(" directory: ")[1].strip())

    def lab_args(self):
        return ["jupyter-lab",
                "--no-browser",
                "--NotebookApp.token='{}'".format(self.token),
                "--NotebookApp.password=''",
                "--port={}".format(self.port)]

    def start_lab(self, url_root, cwd):
        # start a lab server
        lab = subprocess.Popen(self.lab_args(), cwd=cwd)
        timeout = 10

        while timeout:
            try:
                HTTPClient().fetch("{}?token={}".format(url_root, self.token),
                                   method="GET")
                return lab
            except Exception:
                timeout -= 1
                time.sleep(0.5)

    def fetch_one(self, url_root, url, resources):
        mirror_args = ["wget",
                       "--page-requisites",
                       "--convert-links",
                       "-e", "robots=off",
                       "-P", resources["output_files_dir"],
                       "{}/{}?token={}".format(url_root, url, self.token)]
        # scrape the hell out of it
        mirror = subprocess.Popen(mirror_args)
        mirror.wait()

    def copy_assets(self, output_root, lab_path):
        shutil.rmtree(join(output_root, "lab", "static"))
        shutil.copytree(join(lab_path, "static"),
                        join(output_root, "lab", "static"))

        themes_out = join(output_root, "lab", "api", "themes")
        if os.path.exists(themes_out):
            shutil.rmtree(themes_out)
        shutil.copytree(join(lab_path, "themes"), themes_out)

        for urls in Path(themes_out).rglob("urls.css"):
            css = urls.read_text()
            url_frag = urls.parent.relative_to(output_root)
            print(urls)
            css = re.sub(
                r"""(url\(['"])(images|icons)""",
                r"\1../{}/\2".format(url_frag),
                css
            )
            urls.write_text(css)

    def fix_index(self, output_root):
        index = join(output_root, "lab", "index.html")
        if exists(index):
            os.unlink(index)
        shutil.move(
            glob(join(output_root, "lab*token*"))[0],
            index,
        )
        idx = Path(index)

        new_idx = re.sub(
            '(<script.*?id="jupyter-config-data".*?>).*?(</script>)',
            '\\1\n{}\n</script>'.format(
                json.dumps(self.jupyter_config_data, indent=2)),
            idx.read_text(),
            flags=re.M | re.S)

        # new_idx = re.sub(
        #     r'(<head .*?>)',
        #     '\\1<base href="./lab" />',
        #     new_idx
        # )

        new_idx = re.sub(r'src="lab', 'src="../lab', new_idx)

        idx.write_text(new_idx)

    def fix_urls(self, output_root, nb_names):
        self.fix_index(output_root)

        # handle the rest
        [
            shutil.move(str(t), str(t.parent / t.name.split("?")[0]))
            for t in
            (Path(output_root)).rglob("*?token={}".format(self.token))
        ]

        self.fix_contents(output_root, nb_names)

    def fix_contents(self, output_root, nb_names):
        parents = set()

        for nb_name in nb_names:
            parents = parents | set(
                Path(output_root, "api", "contents", nb_name)
                .relative_to(Path(output_root) / "api" / "contents")
                .parents
            )

        for parent in [p for p in parents if p != Path(".")]:
            parent_path = (
                Path(output_root) / "api" / "contents" / parent
            )
            contents = (parent_path / parent.name).read_text()
            (parent_path / parent.name).unlink()
            (parent_path / "index.html").write_text(contents)

        for nb_name in nb_names:
            nb_file = "{}.ipynb".format(nb_name)
            ipynb = Path(output_root) / "api" / "contents" / nb_file
            contents = ipynb.read_text()
            ipynb.unlink()
            ipynb.mkdir()
            (ipynb / "index.html").write_text(contents)
            (ipynb / "checkpoints").write_text("[]")

    def fake_apis(self, output_root):
        api_root = Path(output_root) / "api"
        api_root.mkdir(exist_ok=True)

        out = Path(output_root)

        for path, response in self.dummy_apis.items():
            the_json = json.dumps(response)
            if path.endswith("/"):
                (out / path).mkdir(exist_ok=True)
                out_path = out / path / "index.html"
            else:
                out_path = out / path
            out_path.write_text(the_json)
