from ._version import __version__  # noqa

from .serverextension import JyveServerExtension


def load_jupyter_server_extension(nb_server_app):
    (
        JyveServerExtension(nb_server_app)
        .patch_wasm()
        .patch_nbconvert()
        .warn("jyve activated")
    )
