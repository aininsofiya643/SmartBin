const API_URL = "https://script.google.com/macros/s/AKfycbzcGM7yiCAv2ATsuoPLvqqhhvELabcqC9MwAtYiyLoVZnv_uuwxxGDkqEIASkmmnvCM/exec";

let scannedBin = "";
let isLocked = false;
let lastData = "";

/* ================= BIN DATABASE ================= */
const bins = {
    "A2-2": { block: "A", floor: "2", location: "Near Toilet" },
    "A1-1": { block: "A", floor: "1", location: "Lobby" },
    "B1-1": { block: "B", floor: "1", location: "Cafeteria" }
};

/* ================= GET BIN FROM QR URL ================= */
function getBinFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("bin");
}

/* ================= LOAD BIN INFO ================= */
function loadBin(bin) {

    scannedBin = bin;

    const info = bins[bin];

    if (!info) {
        document.getElementById("binTitle").innerText = "UNKNOWN BIN";
        return;
    }

    document.getElementById("binTitle").innerText = "SMART BIN " + bin;

    document.getElementById("block").innerText = "Block: " + info.block;
    document.getElementById("floor").innerText = "Floor: " + info.floor;
    document.getElementById("location").innerText = "Location: " + info.location;

    document.getElementById("binInfo").style.display = "block";

    refreshHistory();
}

/* ================= CLEAN BUTTON ================= */
function markClean() {

    if (isLocked) return;
    isLocked = true;

    let btn = document.getElementById("cleanBtn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    let payload = {
        bin: scannedBin,
        cleaner: document.getElementById("dutyPerson").innerText,
        status: "CLEANED"
    };

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.text())
    .then(() => {

        document.getElementById("status").innerText = "Status: CLEAN";

        document.getElementById("lastUpdated").innerText =
            new Date().toLocaleTimeString();

        refreshHistory();

        btn.innerText = "Already CLEANED";
    })
    .catch(err => {
        console.log(err);
        isLocked = false;
        btn.disabled = false;
        btn.innerText = "Mark as CLEANED";
    });
}

/* ================= HISTORY ================= */
function refreshHistory() {

    fetch(API_URL + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {

        let html = "";

        data
        .filter(item => item.bin === scannedBin)
        .reverse()
        .forEach(item => {

            html += `
                <div class="history-item">
                    📅 ${item.date} | ⏰ ${item.time}<br>
                    🗑 Bin: ${item.bin}<br>
                    👷 ${item.cleaner} | ${item.status}
                </div>
            `;
        });

        document.getElementById("history").innerHTML = html;
    });
}

/* ================= INIT ================= */
window.onload = function () {

    const bin = getBinFromURL();

    if (bin) {
        loadBin(bin);
    } else {
        document.getElementById("binTitle").innerText = "NO BIN SCANNED";
    }

    refreshHistory();
};

setInterval(refreshHistory, 5000);
