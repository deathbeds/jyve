import http.server
import socketserver

PORT = 19980

Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map.update({".wasm": "application/wasm"})

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port", PORT)


if __name__ == "__main__":
    httpd.serve_forever()
