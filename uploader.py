#!/bin/python3

import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi

class FileUploadHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'''
                <html>
                <body>
                    <h2>File Upload</h2>
                    <form enctype="multipart/form-data" method="post">
                        <input type="file" name="file"/>
                        <input type="submit" value="Upload"/>
                    </form>
                </body>
                </html>
            ''')
        else:
            self.send_error(404, "File not found")

    def do_POST(self):
        if self.path == '/':
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )

            filename = form['file'].filename
            data = form['file'].file.read()

            with open(os.path.join('content/attachments', filename), 'wb') as f:
                f.write(data)

            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"File {filename} uploaded successfully".encode())

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, FileUploadHandler)
    print(f"Server running on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    if not os.path.exists('content/attachments'):
        os.makedirs('content/attachments')
    run_server()
