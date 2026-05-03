"""
app.py — Robust Python server for DustyShelf
Features:
- Handles extension-less URLs (e.g., /login -> /login.html)
- Proper MIME types
- Prevents connection abort errors where possible
"""

import http.server
import socketserver
import os
import webbrowser
import threading
from http import HTTPStatus

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Handle extension-less URLs
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not path.endswith('.html'):
            if os.path.exists(path + '.html'):
                self.path += '.html'
        
        try:
            return super().do_GET()
        except (ConnectionAbortedError, ConnectionResetError):
            # Ignore these common development server errors
            pass

    def log_message(self, format, *args):
        # Clean log output
        pass

def open_browser():
    import time
    time.sleep(1.5)
    print(f"  > Opening http://localhost:{PORT}")
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == "__main__":
    os.chdir(DIRECTORY)

    print("=" * 60)
    print("  DUSTYSHELF DEVELOPMENT SERVER")
    print("=" * 60)
    print(f"  Root:    {DIRECTORY}")
    print(f"  URL:     http://localhost:{PORT}")
    print("  Status:  Running (Press Ctrl+C to stop)")
    print("=" * 60)

    # Auto-open browser in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Use Allow Reuse Address to avoid "Address already in use" errors on restart
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped by user.")
    except Exception as e:
        print(f"\n  Server error: {e}")
