"""Forward only loopback TCP to the dedicated internal Docker test network.

Run before `supabase start` in a separate terminal; stop with Ctrl-C after the
tests and stack teardown. Docker 28 does not publish ports on --internal networks.
This relays bytes without changing requests/responses or providing fake services.
"""
import json
import select
import socket
import socketserver
import subprocess
import threading

NETWORK = 'gliax-local-20261117'


class Relay(socketserver.BaseRequestHandler):
    def handle(self):
        container, port = self.server.target
        try:
            details = json.loads(subprocess.check_output(
                ['docker', 'inspect', '--type', 'container', container], stderr=subprocess.DEVNULL))[0]
            networks = details['NetworkSettings']['Networks']
            assert list(networks) == [NETWORK]
            assert details['Config']['Labels']['com.supabase.cli.project'] == NETWORK
            host = networks[NETWORK]['IPAddress']
            with socket.create_connection((host, port), timeout=10) as upstream:
                peers = [self.request, upstream]
                while True:
                    readable, _, _ = select.select(peers, [], [], 20)
                    for source in readable:
                        data = source.recv(65536)
                        if not data:
                            return
                        (upstream if source is self.request else self.request).sendall(data)
        except (OSError, subprocess.CalledProcessError, AssertionError):
            return


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    network = json.loads(subprocess.check_output(['docker', 'network', 'inspect', NETWORK]))[0]
    assert network['Internal'] is True
    for local, container, remote in [(55432, 'supabase_db_'+NETWORK, 5432),
                                      (55431, 'supabase_kong_'+NETWORK, 8000)]:
        server = Server(('127.0.0.1', local), Relay)
        server.target = (container, remote)
        threading.Thread(target=server.serve_forever, daemon=True).start()
    print('Local TCP relay: 127.0.0.1:55431/55432 -> '+NETWORK, flush=True)
    threading.Event().wait()
