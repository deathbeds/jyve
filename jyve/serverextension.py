import mimetypes

from traitlets.config import LoggingConfigurable
from nbconvert.exporters.export import exporter_map

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
            return _guess(name, strict)

        mimetypes.guess_type = guess_type

        return self.warn(f"mimetypes is no longer safe")

    def patch_nbconvert(self):
        exporter_map.update(jyve=JyveExporter)
        return self.warn(f"nbconvert is no longer safe")
