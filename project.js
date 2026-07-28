// Data Display
function updateTable(data) {
    HTML.thead.innerHTML = "";
    HTML.tbody.innerHTML = "";
    HTML.intro.style.display = "none";
    let realIndex = 0;

    data.forEach(addRow);
    function addRow(row, index) {
        const tr = document.createElement("tr");
        const searchDrugText = HTML.searchDrug.value;
        const searchGenText = HTML.searchGen.value;
        const regex_searchDrugText = new RegExp(searchDrugText, "gi");
        const regex_searchGenText = new RegExp(searchGenText, "gi");

        if (index !== 0 && !row[0].toLowerCase().includes(searchDrugText.toLowerCase())) {return};
        if (index !== 0 && !row.toString().toLowerCase().includes(searchGenText.toLowerCase())) {return};

        const type = (index === 0) ? "th" : "td";
        const rowContent = (index === 0) ? [...headerNames] : [realIndex + 1, ...row];
        if (index !== 0) {realIndex++};

        rowContent.forEach(addCell);
        function addCell(value, index) {            
            let origIndex = index;
            if (!config.enabledColumns[index]) return; // Visibility Check
            if ((index === 4 || index === 5) && !config.enabledColumns[3]) return;
            if ((index === 15) && !config.enabledColumns[14]) return;

            if ((value === "") && type === "th") return; // Header Colspan Check

            if (origIndex === 1 && searchDrugText.length > 1) { 
                value = value.replaceAll(regex_searchDrugText, match => 
                `<span class="text-found">${match}</span>`);
            } // Drug Search

            if (origIndex !== 0 && searchGenText.length > 1) {
                value = value.replaceAll(regex_searchGenText, match => 
                `<span class="text-found">${match}</span>`);
            } // Gen Search

            const cell = document.createElement(type); 

            cell.classList.add(...headerColumns[index][1]);

            if (origIndex === 3 && type === "th") {
                cell.setAttribute("colspan", "3");
            } // Header Colspan (Pharm Class)

            if (origIndex === 14 && type === "th") {
                cell.setAttribute("colspan", "2");
            } // Header Colspan (ADR)

            cell.innerHTML = value ?? "";
            tr.appendChild(cell);
        }

        if (index === 0) {
            HTML.thead.appendChild(tr);
        } else {
            HTML.tbody.appendChild(tr);
        }
    }
}

function runUpdateTable(){
    fetch(dataSheetUrl)
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

// Search
HTML.searchDrug.addEventListener("input", (event) => {runUpdateTable()});
HTML.searchGen.addEventListener("input", (event) => {runUpdateTable()});

// Visibility & Order
let realCount = 0;
headerNames.forEach((value, index) => {
    if (value === "") return;
    const name = document.createElement("div");
    const button = document.createElement("div");

    realCount++;

    name.textContent = value;
    button.textContent = "";

    if (!config.enabledColumns[index]) {
        name.classList.toggle("disabled");
    }

    name.classList.add(headerColumns[index][1][1]);

    HTML.visiBox.appendChild(name);
    if (HTML.visiBoxName.length !== headerNames.length) {
        HTML.visiBoxName[index] = document.querySelector(`.visibility-box > div:nth-child(${realCount})`);
    }

    if (index > 1) HTML.visiBoxName[index].appendChild(button);
    if (HTML.visiBoxButton.length !== headerNames.length) {
        HTML.visiBoxButton[index] = document.querySelector(`.visibility-box > div:nth-child(${realCount}) > div`);
    }
});

HTML.visiBoxName.forEach((value, index) => {
    HTML.visiBoxName[index].addEventListener("click", () => {
        changeVisi(index);
    })
})

function changeVisi(index) {
    if (index > 1) {
        config.enabledColumns[index] = !(config.enabledColumns[index]);
        HTML.visiBoxName[index].classList.toggle("disabled");
    }
}

// Run Button
HTML.runButton.addEventListener("click", () => {runUpdateTable()});

// Intro
let firstRun = false;
document.addEventListener("keydown", (event) => {
    if (!firstRun) {
        runUpdateTable();
        firstRun = true;
    }
});