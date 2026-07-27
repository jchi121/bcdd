// Initialization
const sheetAPIKey = "AIzaSyDFybl2Kxp4RMuCiT1fkTYJUImPfgK8s7g"; 
const sheetId = "1bh0Jr6vpKCfaO8c30WHx2nat-NidhI7qNJ963TFgSpY";
const sheetRange = encodeURIComponent("Drugs!A:AB");
const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${sheetAPIKey}`;

const HTML_thead = document.querySelector(".main-table thead");
const HTML_tbody = document.querySelector(".main-table tbody");
const HTML_intro = document.querySelector(".intro");
const HTML_searchDrug = document.querySelector(".search-drug.search-input");
const HTML_searchGen = document.querySelector(".search-gen.search-input");

// Update Table
function updateTable(data) {
    HTML_thead.innerHTML = "";
    HTML_tbody.innerHTML = "";
    HTML_intro.style.display = "none";
    let realIndex = 0;

    data.forEach(addRow);
    function addRow(row, index) {
        const tr = document.createElement("tr");
        const searchDrugText = HTML_searchDrug.value;
        const searchGenText = HTML_searchGen.value;
        const regex_searchDrugText = new RegExp(searchDrugText, "gi");
        const regex_searchGenText = new RegExp(searchGenText, "gi");

        if (index !== 0 && !row[0].toLowerCase().includes(searchDrugText.toLowerCase())) {return};
        if (index !== 0 && !row.toString().toLowerCase().includes(searchGenText.toLowerCase())) {return};

        const type = (index === 0) ? "th" : "td";
        const rowContent = (index === 0) ? ["No.", ...row] : [realIndex + 1, ...row];
        if (index !== 0) {realIndex++};

        rowContent.forEach(addCell);
        function addCell(value, index) {
            if (!config.enabledColumns[index]) {return}

            let origIndex = index;
            if (origIndex === 1 && searchDrugText.length > 1) {
                value = value.replaceAll(regex_searchDrugText, match => 
                `<span class="text-found">${match}</span>`);
            }
            if (origIndex !== 0 && searchGenText.length > 1) {
                value = value.replaceAll(regex_searchGenText, match => 
                `<span class="text-found">${match}</span>`);
            }

            const cell = document.createElement(type); 

            cell.classList.add(...columnClasses[index]);
            
            cell.innerHTML = value ?? "";
            tr.appendChild(cell);
        }

        if (index === 0) {
            HTML_thead.appendChild(tr);
        } else {
            HTML_tbody.appendChild(tr);
        }
    }
}

function run(){
    fetch(sheetUrl)
        .then(response => {
            console.log("HTTP Status:", response.status);
            return response.json();
        })

        .then(data => {

            console.log("API Response:", data);

            if (data.error) {
                console.error("Google API Error:", data.error.message);
                return;
            }

            if (!data.values) {
                console.error("No values were returned.");
                return;
            }

            updateTable(data.values);
            console.log(data);

        })
        
        .catch(error => {
            console.error("Fetch Error:", error);
        });
}

// HTML Events
HTML_searchDrug.addEventListener('input', (event) => {run()});
HTML_searchGen.addEventListener('input', (event) => {run()});

let firstRun = false;
document.addEventListener("keydown", function (event) {
    if (!firstRun) {
        run();
        firstRun = true;
    }
});