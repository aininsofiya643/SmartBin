const API_URL = "https://script.google.com/macros/s/AKfycbx-CzZoAeA9jUdJklHAX9ZiwB9-uxtZ0guIT0JlXvKGyTxOboJOq1SYnMNMBN3Lhtk/exec";

let selectedBin = "";
let isLocked = false;

/* ================= LOAD BINS ================= */
function loadBins() {
    fetch(API_URL + "?mode=bins")
    .then(res => res.json())
    .then(data => {
        let select = document.getElementById("binSelect");
        select.innerHTML = "<option value=''>Select Bin</option>";
        data.forEach(bin => {
            select.innerHTML += `<option value="${bin.id}">${bin.id}</option>`;
        });
    });
}

/* ================= LOAD SELECTED BIN ================= */
function loadSelectedBin() {

    selectedBin = document.getElementById("binSelect").value;
    if (!selectedBin) return;

    let loadBtn = document.getElementById("loadBtn");
    loadBtn.disabled = true;
    loadBtn.innerText = "Loading...";
    loadBtn.classList.add("loading-btn");

    fetch(API_URL + "?bin=" + selectedBin + "&t=" + Date.now())
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            loadBtn.disabled = false;
            loadBtn.innerText = "Load Bin";
            loadBtn.classList.remove("loading-btn");
            return;
        }

        document.getElementById("selectWrap").style.display = "none";

        let binInfo = document.getElementById("binInfo");
        binInfo.style.display = "block";
        binInfo.classList.add("fade-in");

        document.getElementById("block").innerText = "Block: " + data.bin.block;
        document.getElementById("floor").innerText = "Floor: " + data.bin.floor;
        document.getElementById("location").innerText = "Location: " + data.bin.location;
        document.getElementById("dutyPerson").innerText = data.duty;
        document.getElementById("status").innerText = "Status: " + data.status;
        document.getElementById("lastUpdated").innerText = data.lastUpdated;

        loadHistory(data.history);

// ---- Always start fresh and clickable on load/reload ----

let btn = document.getElementById("cleanBtn");
btn.disabled = false;
btn.innerText = "Mark as CLEANED";
btn.style.background = "#2d89ef";
isLocked = false;

    })
    .catch(err => {
        console.log(err);
        alert("Failed to load bin. Please try again.");
        loadBtn.disabled = false;
        loadBtn.innerText = "Load Bin";
        loadBtn.classList.remove("loading-btn");
    });
}

/* ================= CLEAN BUTTON ================= */
/* ================= CLEAN BUTTON ================= */
function markClean() {

    if (isLocked) return;
    isLocked = true;

    let btn = document.getElementById("cleanBtn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    let payload = {
        bin: selectedBin,
        cleaner: document.getElementById("dutyPerson").innerText,
        status: "CLEANED"
    };

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.text())
    .then(() => {

        // Immediately update UI — no need to wait for a re-fetch
        btn.innerText = "Already CLEANED";
        btn.style.background = "gray";
        btn.disabled = true;
        isLocked = true;

        document.getElementById("status").innerText = "Status: Cleaned";

        document.getElementById("lastUpdated").innerText = new Date().toLocaleString();


     // Refresh everything from the server — gets correctly formatted
// lastUpdated and history in one go, no guessing on the frontend
fetch(API_URL + "?bin=" + selectedBin + "&t=" + Date.now())
.then(res => res.json())
.then(data => {
    if (!data.error) {
        document.getElementById("lastUpdated").innerText = data.lastUpdated;
        loadHistory(data.history);
    }
});
    })
    .catch(err => {
        console.log(err);
        isLocked = false;
        btn.disabled = false;
        btn.innerText = "Mark as CLEANED";
        btn.style.background = "#2d89ef";
    });
}/* ================= HISTORY ================= */
function loadHistory(history) {

    let html = "";

    history.slice().reverse().forEach(item => {
        html += `
        <div class="history-item">
            📅 ${item.date} | ⏰ ${item.time}<br>
            🗑 Bin: ${item.bin}<br>
            👷 ${item.cleaner} | ${item.status}
        </div>
        `;
    });

    document.getElementById("history").innerHTML = html || "No history yet";
}

/* ================= INIT ================= */
window.onload = function () {
    loadBins();
};
