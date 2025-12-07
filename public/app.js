const socket = io();

// Display logs in table
socket.on("log", (msg) => {
    const row = document.createElement("tr");
    const col = document.createElement("td");
    col.textContent = msg;
    row.appendChild(col);
    document.getElementById("logTable").appendChild(row);

    // Auto-scroll
    const logBox = document.querySelector(".log-box");
    logBox.scrollTop = logBox.scrollHeight;
});

// Start Python
async function startPython() {
    await fetch("/start");
}

// Stop Python
async function stopPython() {
    await fetch("/stop");
}
