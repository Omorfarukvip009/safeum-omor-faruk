const express = require("express");
const { spawn } = require("child_process");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

let pythonProcess = null;

// Start Python process
app.get("/start", (req, res) => {
    if (pythonProcess) return res.json({ status: "already_running" });

    pythonProcess = spawn("python3", ["main.py"]);

    pythonProcess.stdout.on("data", (data) => {
        io.emit("log", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
        io.emit("log", `ERROR: ${data.toString()}`);
    });

    pythonProcess.on("close", () => {
        io.emit("log", "Process stopped");
        pythonProcess = null;
    });

    res.json({ status: "started" });
});

// Stop Python process
app.get("/stop", (req, res) => {
    if (!pythonProcess) return res.json({ status: "not_running" });

    pythonProcess.kill("SIGTERM");
    pythonProcess = null;

    res.json({ status: "stopped" });
});

// Run server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
