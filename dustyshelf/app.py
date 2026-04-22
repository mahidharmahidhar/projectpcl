"""
app.py — Simple Python server for DustyShelf
Run this file to start the local server:
  python app.py
Then open: http://localhost:3000
"""

import http.server
import socketserver
import os
import webbrowser
import threading

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"  [{self.address_string()}] {format % args}")


def open_browser():
    import time
    time.sleep(1)
    webbrowser.open(f"http://localhost:{PORT}")


if __name__ == "__main__":
    os.chdir(DIRECTORY)

    print("=" * 50)
    print("  📚 DustyShelf Local Server")
    print("=" * 50)
    print(f"  Serving: {DIRECTORY}")
    print(f"  URL:     http://localhost:{PORT}")
    print(f"  Press Ctrl+C to stop")
    print("=" * 50)

    # Auto-open browser
    threading.Thread(target=open_browser, daemon=True).start()

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")
