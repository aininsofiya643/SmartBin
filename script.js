const API_URL = "https://script.google.com/macros/s/AKfycbyHxqxlp4uiNcp3_oZy1DVbcNKuQU0Fm208Zf4wLgUPhlQ339ml-ykvXBDWUqEPgJkw/exec";

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

    fetch(API_URL + "?bin=" + selectedBin)
    .then(res => res.json())
    .then(data => {

        document.getElementById("binInfo").style.display = "block";

        document.getElementById("block").innerText = "Block: " + data.bin.block;
        document.getElementById("floor").innerText = "Floor: " + data.bin.floor;
        document.getElementById("location").innerText = "Location: " + data.bin.location;

        document.getElementById("dutyPerson").innerText = data.duty;
        document.getElementById("status").innerText = "Status: " + data.status;

        loadHistory(data.history);
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

        btn.innerText = "CLEANED";
        btn.style.background = "gray";

        document.getElementById("status").innerText = "Status: CLEAN";

        document.getElementById("lastUpdated").innerText =
            new Date().toLocaleString();

        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = "Mark as CLEANED";
            btn.style.background = "#2d89ef";
            isLocked = false;
        }, 5000);

    })
    .catch(err => {
        console.log(err);
        isLocked = false;
        btn.disabled = false;
        btn.innerText = "Mark as CLEANED";
    });
}

/* ================= HISTORY ================= */
function loadHistory(history) {

    let html = "";

    history.reverse().forEach(item => {

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
window.onload = function () {
    loadBins();
};