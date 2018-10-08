#!/usr/bin/env python3
from pathlib import Path
from tempfile import TemporaryDirectory

from OpenSSL import crypto

from tornado import web, ioloop


PORT = 8443


def make_ssl_options(cert_path):
    # create a key pair
    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, 1024)

    # create a self-signed cert
    cert = crypto.X509()
    subj = cert.get_subject()
    subj.C = "US"
    subj.ST = "GA"
    subj.L = "ATL"
    subj.O = "Dead Pixels Collection"
    subj.OU = "deathbeds"
    subj.CN = "jyve"

    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(10 * 365 * 24 * 60 * 60)
    cert.set_issuer(subj)
    cert.set_pubkey(key)
    cert.sign(key, "sha256")

    certfile = cert_path / "jyve.crt"
    keyfile = cert_path / "jyve.key"

    certfile.write_bytes(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
    keyfile.write_bytes(crypto.dump_privatekey(crypto.FILETYPE_PEM, key))

    return dict(
        certfile=str(certfile),
        keyfile=str(keyfile)
    )


class IndexHandler(web.StaticFileHandler):
    def parse_url_path(self, url_path):
        if not url_path or url_path[-1] == "/":
            url_path += "index.html"
        return url_path


if __name__ == "__main__":
    with TemporaryDirectory() as td:
        web.Application(
            handlers=[
                (r"^/d/e/m/o/(.*)", IndexHandler,
                 dict(path="demo"))
            ],
            debug=True
        ).listen(PORT, ssl_options=make_ssl_options(Path(td)))
        print(f"Listening on https://localhost:{PORT}/d/e/m/o/")
        ioloop.IOLoop.instance().start()
