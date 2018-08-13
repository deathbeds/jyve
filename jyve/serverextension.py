import mimetypes
from pathlib import Path

from traitlets.config import LoggingConfigurable
from nbconvert.exporters.export import exporter_map
from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import FileFindHandler


from .exporter import JyveExporter


WASM_MIME = "application/wasm"
EMO = "🗂"


class JyveServerExtension(LoggingConfigurable):
    def __init__(self, notebookapp):
        super().__init__()
        self._app = notebookapp
        self.log = notebookapp.log

    def error(self, msg, *args):
        self.log.error(f"{EMO}      {msg}", *args)
        return self

    def warn(self, msg, *args):
        self.log.debug(f" {EMO}     {msg}", *args)
        return self

    def info(self, msg, *args):
        self.log.info(f"  {EMO}    {msg}", *args)
        return self

    def patch_wasm(self):
        _guess = mimetypes.guess_type

        def guess_type(name, strict=True):
            # https://www.iana.org/assignments/provisional-standard-media-types/provisional-standard-media-types.xhtml
            if name[-5:] == ".wasm":
                self.warn(f"Saying {name} is some wasm")
                return (WASM_MIME, None)
            guess = _guess(name, strict)
            # self.warn(f"guessed {name} {guess}")
            return guess

        mimetypes.guess_type = guess_type

        return self.warn(f"mimetypes is no longer safe")

    def patch_nbconvert(self):
        exporter_map.update(jyve=JyveExporter)
        return self.warn(f"nbconvert is no longer safe")

    def add_vendor_route(self):
        app = self._app.web_app
        ns = ujoin(app.settings["base_url"], "/jyve")
        app.add_handlers(
            ".*$",
            [
                (
                    ujoin(ns, "vendor", "(.*)"),
                    FileFindHandler,
                    dict(path=str(Path(__file__).parent / "vendor")),
                )
            ],
        )
        return self.warn(f"vendored paths are available")
