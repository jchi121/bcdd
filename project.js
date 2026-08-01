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

        if (index !== 0 && !row[0].toLowerCase().includes(searchDrugText.toLowerCase())) return;
        if (index !== 0 && !row.toString().toLowerCase().includes(searchGenText.toLowerCase())) return;

        let filterPass = [];
        if (config.filter.length > 0 && index !== 0) {
            config.filter.forEach((speFilter) => {
                speFilter.filter.forEach((filterValue) => {
                    if (row[speFilter.header - 1].toLowerCase().includes(filterValue.toLowerCase())) {
                        filterPass.push(true);
                    }

                    if (speFilter.header === 3) {
                        console.log("found");
                        for (i = 0; i < 2; i++) {
                            if (row[speFilter.header + i].toLowerCase().includes(filterValue.toLowerCase())) {
                                filterPass.push(true);
                            }
                        }
                    }
                })
            })
        }
        if (config.filter.length > 0 && index !== 0 && !(filterPass.length === config.filter.length)) return;

        const type = (index === 0) ? "th" : "td";
        const rowContent = (index === 0) ? [...headerNames] : [realIndex + 1, ...row];
        if (index !== 0) {realIndex++};

        rowContent.forEach(addCell);
        function addCell(value, index) {            
            if (!config.enabledColumns[index]) return; // Visibility Check
            if ((index === 4 || index === 5) && !config.enabledColumns[3]) return;
            if ((index === 15) && !config.enabledColumns[14]) return;

            if ((value === "") && type === "th") return; // Header Colspan Check

            if (index === 1 && searchDrugText.length > 1) { 
                value = value.replaceAll(regex_searchDrugText, match => 
                `<span class="text-found">${match}</span>`);
            } // Drug Search

            if (index !== 0 && searchGenText.length > 1) {
                value = value.replaceAll(regex_searchGenText, match => 
                `<span class="text-found">${match}</span>`);
            } // Gen Search

            const cell = document.createElement(type); 

            cell.classList.add(...headerColumns[index].classes);

            if (index === 3 && type === "th") {
                cell.setAttribute("colspan", "3");
            } // Header Colspan (Pharm Class)

            if (index === 14 && type === "th") {
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
async function updateData(show = true) {
    try {
        const response = await fetch(dataSheetUrl);

        console.log("HTTP Status:", response.status);

        const csv = await response.text();

        const parsed = Papa.parse(csv, {
            skipEmptyLines: true
        });

        dataSheetData = parsed.data;

        if (show) updateTable();

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

HTML.searchDrug.addEventListener("input", () => {
    if (dataSheetData && firstRun) {updateTable()}
});

HTML.searchGen.addEventListener("input", () => {
    if (dataSheetData && firstRun) {updateTable()}
});

// Filter
let selectedFilterHeader = -1;
const selectedFilterContent = [];
headerNames.forEach((value, index) => {
    if (value === "") return;
    if (!headerColumns[index].isFilterable) return;

    const headerChoice = document.createElement("li");
    headerChoice.innerHTML = value;
    headerChoice.classList.add(headerColumns[index].classes[1]);

    HTML.filterHeaderList.appendChild(headerChoice);
    HTML.filterHeaderChoice[index] = headerChoice;
}); // Add Filter Header Choices

let contentList = [];
async function updateContentList(colIndex) {    
    if (!dataSheetData) {await updateData(false)}

    const contentListSet = new Set();
    clearFilterContent();

    dataSheetData.forEach((value, rowIndex) => {
        if (rowIndex === 0) return;

        let content = "";
        if (colIndex === 3) {
            let contentArr = [];
            for (i = -1; i < 2; i++) {
                if (value[colIndex + i] === "") continue;
                contentArr.push(value[colIndex + i]);
            }
            content = contentArr.join(", ");
        } else {
            content += value[colIndex - 1];
        }

        if (content === "") return;
        content.split(", ").forEach(item => contentListSet.add(item));
    })

    contentList = [...contentListSet];

    contentList.sort((a, b) => a.localeCompare(b));

    contentList.forEach((value, listIndex) => {
        if (value === "") return;

        const contentChoice = document.createElement("li");
        contentChoice.innerHTML = value;
        contentChoice.classList.add(headerColumns[colIndex].classes[1]);

        HTML.filterContentList.appendChild(contentChoice);

        HTML.filterContentChoice[listIndex] = contentChoice;
    });

    addFilterContentOnClick();
} // Add Filter Content Choices

HTML.filterHeaderInput.addEventListener("focus", () => {
    HTML.filterHeaderList.style.display = "block";
    HTML.visiBox.style.opacity = 0.25;
});

HTML.filterHeaderInput.addEventListener("blur", () => {
    HTML.filterHeaderList.style.display = "none";
    HTML.visiBox.style.opacity = 1;
});

HTML.filterContentInput.addEventListener("focus", () => {
    if (selectedFilterHeader === -1) return;
    HTML.filterContentList.style.display = "block";
    HTML.filterAddHeader.style.borderRadius = "4px 4px 0px 0px";
    HTML.visiBox.style.opacity = 0.25;
});

HTML.filterContentInput.addEventListener("blur", () => {
    HTML.filterContentList.style.display = "none";
    HTML.visiBox.style.opacity = 1;
});

HTML.filterHeaderInput.addEventListener("input", (event) => {
    const inputValue = event.target.value;

    HTML.filterHeaderList.style.display = "block";
    headerStyles.forEach(value => HTML.filterHeaderInput.classList.remove(value))
    selectedFilterHeader = 0;

    if (contentList !== []) clearFilterContent();

    filterAutocomp(HTML.filterHeaderChoice, HTML.filterHeaderList, inputValue, headerNames);
});

HTML.filterContentInput.addEventListener("input", (event) => {
    const inputValue = event.target.value;

    HTML.filterContentList.style.display = "block";
    headerStyles.forEach((value) => {HTML.filterContentInput.classList.remove(value);})

    filterAutocomp(HTML.filterContentChoice, HTML.filterContentList, inputValue, contentList);
});

function filterAutocomp(HTML_choice, HTML_container, input, text) {
    let foundMatch = false;
    const regex_inputValue = new RegExp(input, "gi");

    HTML_choice.forEach((value, index) => {
        value.innerHTML = text[index];

        if (!text[index].toLowerCase().includes(input.toLowerCase())) {
            value.style.display = "none";
            return;
        }

        if (input.length > 1) {
            value.innerHTML = text[index].replaceAll(regex_inputValue, match => 
            `<span class="text-found">${match}</span>`);
        } 

        foundMatch = true;
        value.style.display = "block";
    })

    if (!foundMatch) {
        HTML_container.style.display = "none";
    }
}

HTML.filterHeaderChoice.forEach((value, index) => {
    value.addEventListener("mousedown", () => {
        HTML.filterHeaderInput.value = headerNames[index];
        headerStyles.forEach(value => HTML.filterHeaderInput.classList.remove(value))
        HTML.filterHeaderInput.classList.add(headerColumns[index].classes[1]);

        selectedFilterHeader = index;
        updateContentList(index);
    })
}); // Click Filter Header Choice

function addFilterContentOnClick() {
    HTML.filterContentChoice.forEach((value, index) => {
        value.addEventListener("mousedown", () => {
            let filterValue = contentList[index];
            headerStyles.forEach(value => HTML.filterContentInput.classList.remove(value))

            value.style.display = "none";

            addFilterInput(filterValue);
        })
    });
} // Click Filter Content Choice

function addFilterInput(value) {
    selectedFilterContent.push(value);
    const newInput = document.createElement("div");
    const newInputButton = document.createElement("div");

    newInput.innerHTML = value;
    newInput.classList.add("filter-new-input", "no-scroll-bar");

    newInputButton.addEventListener("click", () => {
        HTML.filterContentNew.removeChild(newInput);
        selectedFilterContent.splice(selectedFilterContent.indexOf(value), 1);
        if (selectedFilterContent.length === 0) HTML.filterContentNew.style.display = "none";
    })

    newInput.appendChild(newInputButton);
    HTML.filterContentNew.appendChild(newInput);
    HTML.filterContentNew.style.display = "flex";
} // Add Selected Filter Content

HTML.filterAddButton.addEventListener("click", () => {
    if (selectedFilterHeader == -1 || selectedFilterContent.length == 0) return;
    config.filter.push({ header: selectedFilterHeader, filter: [...selectedFilterContent] });
    console.log(headerNames[config.filter[0].header]);
    clearFilterHeader();
    clearFilterContent();

    if (dataSheetData && firstRun) updateTable();
}) // Add Filter

function clearFilterHeader() {
    HTML.filterHeaderInput.value = "";
}

function clearFilterContent() {
    contentList = [];
    selectedFilterContent.length = 0;
    HTML.filterContentList.replaceChildren();
    HTML.filterContentInput.value = "";
    HTML.filterContentNew.replaceChildren();
    HTML.filterContentNew.style.display = "none";
    HTML.filterContentChoice.length = 0;
}

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

    name.classList.add(headerColumns[index].classes[1]);

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
        if (dataSheetData && firstRun) updateTable();
    }
}

HTML.visiDefaultButton.addEventListener("click", () => {
    config.enabledColumns = [...baseConfig.enabledColumns];
    HTML.visiBoxName.forEach((value, index) => {
        if (config.enabledColumns[index]) {
            HTML.visiBoxName[index].classList.remove("disabled")
        } else HTML.visiBoxName[index].classList.add("disabled")
    })
    if (dataSheetData && firstRun) updateTable();
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
HTML.runButton.addEventListener("click", () => {
    firstRun = true;
    updateData();
});

// Intro
let firstRun = false;
document.addEventListener("keydown", (event) => {
    if (dataSheetData) return;
    if (document.activeElement.tagName === 'INPUT') return;

    firstRun = true;
    updateData();
});