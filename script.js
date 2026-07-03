const API_URL = "YOUR_GOOGLE_SCRIPT_URL";

let scannedBin = "";
let isLocked = false;
let lastData = "";

/* ================= BIN DATABASE ================= */
const bins = {
    "A2-2": { block: "A", floor: "2", location: "Near Toilet" },
    "A1-1": { block: "A", floor: "1", location: "Lobby" },
    "B1-1": { block: "B", floor: "1", location: "Cafeteria" }
};

/* ================= GET BIN FROM URL ================= */
function getBinFromURL() {
    return new URLSearchParams(window.location.search).get("bin");
}

/* ================= LOAD BIN ================= */
function loadBin(bin) {

    scannedBin = bin;

    const info = bins[bin];

    if (!info) {
        alert("Unknown Bin");
        return;
    }

    document.getElementById("binTitle").innerText = "SMART BIN " + bin;

    document.getElementById("block").innerText = "Block: " + info.block;
    document.getElementById("floor").innerText = "Floor: " + info.floor;
    document.getElementById("location").innerText = "Location: " + info.location;

    document.getElementById("binInfo").style.display = "block";

    refreshHistory();
}

/* ================= QR SCANNER ================= */
function startScanner() {

    const html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {

        let cameraId = devices[0].id;

        html5QrCode.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            (decodedText) => {

                scannedBin = decodedText.replace("SMARTBIN:", "");

                html5QrCode.stop();

                loadBin(scannedBin);
            }
        );

    });
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
    });
}

/* ================= HISTORY ================= */
function refreshHistory() {

    fetch(API_URL + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {

        if (JSON.stringify(data) === lastData) return;

        lastData = JSON.stringify(data);

        let html = "";

        data
        .filter(i => i.bin === scannedBin)
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

/* ================= AUTO START ================= */
window.onload = function () {

    const bin = getBinFromURL();

    if (bin) {
        loadBin(bin);
    }

    refreshHistory();
};

setInterval(refreshHistory, 5000);