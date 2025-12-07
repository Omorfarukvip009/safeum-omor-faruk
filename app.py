from flask import Flask, send_from_directory, jsonify
from flask_sock import Sock
import subprocess
import threading
import time
import os

app = Flask(__name__, static_folder="static")
sock = Sock(app)

python_process = None
log_listeners = []


@app.route('/')
def home():
    return send_from_directory('static', 'index.html')


@app.route('/start')
def start_script():
    global python_process

    if python_process and python_process.poll() is None:
        return jsonify({"status": "already_running"})

    python_process = subprocess.Popen(
        ["python3", "main.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    threading.Thread(target=stream_output, daemon=True).start()

    return jsonify({"status": "started"})


@app.route('/stop')
def stop_script():
    global python_process

    if not python_process:
        return jsonify({"status": "not_running"})

    python_process.terminate()
    python_process = None
    return jsonify({"status": "stopped"})


def stream_output():
    """Send Python logs to all connected WebSocket clients."""
    global python_process

    if not python_process:
        return

    for line in python_process.stdout:
        send_to_all(line.strip())

    for err in python_process.stderr:
        send_to_all("ERROR: " + err.strip())


def send_to_all(message):
    """Push log to all WebSocket listeners."""
    for ws in list(log_listeners):
        try:
            ws.send(message)
        except:
            log_listeners.remove(ws)


@sock.route('/logs')
def logs(ws):
    """WebSocket for log streaming."""
    log_listeners.append(ws)

    while True:
        try:
            time.sleep(0.1)
        except:
            break


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
