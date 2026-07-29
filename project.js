// Data Display
function updateTable() {
    HTML.thead.innerHTML = "";
    HTML.tbody.innerHTML = "";
    HTML.intro.style.display = "none";
    let realIndex = 0;

    dataSheetData.forEach(addRow);
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

    config.sortOrder.forEach((value) => {
        sortTable(HTML.tbody, value[0], value[1])
    }) 
}

let dataSheetData = null;
function updateData(){
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

            dataSheetData = data.values;
            updateTable();
        })
        
        .catch(error => {
            console.error("Fetch Error:", error);
        });
}

// Search
HTML.searchDrug.addEventListener("input", () => {
    if (dataSheetData) {updateTable()}
});

HTML.searchGen.addEventListener("input", () => {
    if (dataSheetData) {updateTable()}
});

// Filter
headerNames.forEach((value, index) => {
    if (value === "") return;
    if (!headerColumns[index][2]) return;

    const headerChoice = document.createElement("li");
    headerChoice.innerHTML = value;
    headerChoice.classList.add(headerColumns[index][1][1]);

    HTML.filterHeaderChoiceList.appendChild(headerChoice);
    HTML.filterHeaderChoice[index] = headerChoice;
});

HTML.filterHeaderInput.addEventListener("focus", () => {
    HTML.filterHeaderChoiceList.style.display = "block";
});

HTML.filterHeaderInput.addEventListener("blur", () => {
    HTML.filterHeaderChoiceList.style.display = "none";
});

HTML.filterHeaderInput.addEventListener("input", (event) => {
    const inputValue = event.target.value;
    const regex_inputValue = new RegExp(inputValue, "gi");

    HTML.filterHeaderChoice.forEach((value, index) => {
        if (!headerNames[index].toLowerCase().includes(inputValue.toLowerCase())) {
            value.style.display = "none";
            return;
        }

        if (inputValue.length > 1) {
            value.innerHTML = headerNames[index].replaceAll(regex_inputValue, match => 
            `<span class="text-found">${match}</span>`);           
        }

        value.style.display = "block";
    })
});

HTML.filterHeaderChoice.forEach((value, index) => {
    value.addEventListener("mousedown", () => {
        console.log(headerNames[index]);
        HTML.filterHeaderInput.value = headerNames[index];
    })
});

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
    value.addEventListener("click", () => changeVisi(index))
})

function changeVisi(index) {
    if (index > 1) {
        config.enabledColumns[index] = !(config.enabledColumns[index]);
        HTML.visiBoxName[index].classList.toggle("disabled");
        if (dataSheetData) updateTable();
    }
}

HTML.visiDefaultButton.addEventListener("click", () => {
    config.enabledColumns = [...baseConfig.enabledColumns];
    HTML.visiBoxName.forEach((value, index) => {
        if (config.enabledColumns[index]) {
            HTML.visiBoxName[index].classList.remove("disabled")
        } else HTML.visiBoxName[index].classList.add("disabled")
    })
    if (dataSheetData) updateTable();
})

// Sort
function sortTable(tbody, index, asc = true) {
    if (index === 0) return;

    const dirModifier = asc ? 1 : -1;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const drugNoContent = rows.map(row => row.cells[0].innerHTML);

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[index].textContent.trim();
        const cellB = rowB.cells[index].textContent.trim();
 
        const isEmpty = (cellA === "") || (cellB === "");
        if (isEmpty) {
            return cellA === cellB ? 0 : (cellA === "" ? 1 : -1);
        } else {
            return cellA.localeCompare(cellB) * dirModifier;
        }
    });

    sortedRows.forEach((row, index) => {
        row.cells[0].innerHTML = drugNoContent[index];
        tbody.appendChild(row);
    });
}

// Run Button
HTML.runButton.addEventListener("click", () => {updateData()});

// Intro
let firstRun = true;
document.addEventListener("keydown", (event) => {
    if (!firstRun) return;
    if (document.activeElement.tagName === 'INPUT') return;

    updateData();
    firstRun = false;
});