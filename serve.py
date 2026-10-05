# Статический сервер для прототипа без кеша: браузер всегда берёт свежие файлы.
import http.server, functools

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer(('', 5178), functools.partial(NoCache, directory='proto')).serve_forever()
