let ws = new WebSocket(`wss://${location.host}/logs`);

ws.onmessage = (event) => {
    const table = document.getElementById("logTable");
    const row = document.createElement("tr");
    const col = document.createElement("td");
    col.textContent = event.data;
    row.appendChild(col);
    table.appendChild(row);

    document.querySelector(".log-box").scrollTop =
        document.querySelector(".log-box").scrollHeight;
};

async function startPython() {
    await fetch("/start");
}

async function stopPython() {
    await fetch("/stop");
}
