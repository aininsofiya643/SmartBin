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
function loadBin(data){

    scannedBin = data.bin.id;

    document.getElementById("binTitle").innerText =
        "SMART BIN " + data.bin.id;

    document.getElementById("block").innerText =
        "Block : " + data.bin.block;

    document.getElementById("floor").innerText =
        "Floor : " + data.bin.floor;

    document.getElementById("location").innerText =
        "Location : " + data.bin.location;

    document.getElementById("binInfo").style.display = "block";

    // Populate cleaner dropdown
    let select = document.getElementById("cleanerSelect");

    select.innerHTML = "";

    data.cleaners.forEach(function(cleaner){

        select.innerHTML +=
        `<option value="${cleaner}">
            ${cleaner}
        </option>`;

    });

    loadHistory(data.history);

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
       cleaner: document.getElementById("cleanerSelect").value,
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
function loadHistory(history){

    let html = "";

    history.reverse().forEach(function(item){

        html += `
        <div class="history-item">
            📅 ${item.date} | ⏰ ${item.time}<br>
            🗑 Bin: ${item.bin}<br>
            👷 ${item.cleaner} | ${item.status}
        </div>
        `;

    });

    document.getElementById("history").innerHTML = html;

}

/* ================= INIT ================= */
window.onload = function(){

    const params = new URLSearchParams(window.location.search);

    const bin = params.get("bin");

    if(!bin){

        document.getElementById("binTitle").innerText =
        "NO BIN SELECTED";

        return;
    }

    fetch(API_URL + "?bin=" + bin)

    .then(res => res.json())

    .then(data => {

        loadBin(data);

    })

    .catch(err => {

        console.log(err);

    });

};
