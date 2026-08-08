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

        const passed = config.filter.every(speFilter => {
            const cells =
                speFilter.header === 3 ? [row[2], row[3], row[4], row[5]] :
                speFilter.header === 15 ? [row[14], row[15]] :
                [row[speFilter.header - 1]];

            return speFilter.filter.some(filterValue =>
                cells.some(cell =>
                    cell.split(", ").some(cellSpe => 
                        cellSpe.toLowerCase() === filterValue.toLowerCase())
                )
            );
        });

        if (config.filter.length > 0 && index !== 0 && !passed) {
            return;
        }

        const type = (index === 0) ? "th" : "td";
        const rowContent = (index === 0) ? [...headerNames] : [realIndex + 1, ...row];
        if (index !== 0) {realIndex++};

        rowContent.forEach(addCell);
        function addCell(value, index) {            
            if (!config.enabledColumns[index]) return; // Visibility Check
            if ((index === 4 || index === 5) && !config.enabledColumns[3]) return;
            if ((index === 15) && !config.enabledColumns[14]) return;

            if ((headerColumns[index].isMerged) && type === "th") return; // Header Colspan Check

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

            if (index === 15 && type === "th") {
                cell.setAttribute("colspan", "2");
            } // Header Colspan (ADR)

            if (value === "N/A") {
                cell.innerHTML = "";
            } else {
                cell.innerHTML = value ?? "";
            }
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
    if (headerColumns[index].isMerged) return;
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
    const pharmcSets = Array.from({ length: 4 }, () => new Set());
    const allSets = Array.from({ length: filterableHeaders.length }, () => new Set());
    const allSetsBoundary = [];
    clearFilterContent();
    
    dataSheetData.forEach((row, rowIndex) => {
        if (rowIndex === 0) return;

        let content = "";
        let contentArr = [];
        if (colIndex === getColIndex("Pharmacological Class")) {
            for (let i = -1; i < 3; i++) {
                const cell = row[colIndex + i];
                if (!cell) continue;

                cell.split(", ").forEach(name => pharmcSets[i + 1].add(name));
            }
        } else if (colIndex === getColIndex("Adverse Effects")) {
            for (let i = -1; i < 1; i++) {
                if (row[colIndex + i] === "") continue;
                contentArr.push(row[colIndex + i]);
            }
            content = contentArr.join(", ");        
        } else if (colIndex === -1) {
            filterableHeaders.forEach((fcolIndex, setIndex) => {
                row[fcolIndex - 1].split(", ").forEach(value => {
                        allSets[setIndex].add(value)
                    })
            })
        } else {
            content += row[colIndex - 1];
        }

        if (content === "") return;

        if (colIndex !== 3) content.split(", ").forEach(cell => contentListSet.add(cell));           
    })

    if (colIndex === 3) {
        for (let i = 0; i < 4; i++) {
            [...[...pharmcSets[i]].sort((a, b) => a.localeCompare(b))]
                .forEach(value => contentListSet.add(value))
        }
        contentList = [...contentListSet];
    } else if (colIndex === -1) {
        for (let i = 0; i < filterableHeaders.length; i++) {
            [...[...allSets[i]].sort((a, b) => a.localeCompare(b))]
                .forEach(value => contentList.push(value))
            allSetsBoundary.push(contentList.length - 1);
        }
    } else {
        contentList = [...contentListSet];
        contentList.sort((a, b) => a.localeCompare(b));
    }

    if (config.filter.length > 0) {
        config.filter.forEach(filter => {
            filter.filter.forEach(speFilter => {
                contentList.splice(contentList.indexOf(speFilter), 1)
            })
        })
    }

    contentList.forEach((value, listIndex) => {
        if (value === "") return;

        const contentChoice = document.createElement("li");
        contentChoice.innerHTML = value;

        if (colIndex === -1) {
            let rColIndex = findrColIndex(listIndex, allSetsBoundary)
            contentChoice.classList.add(headerColumns[rColIndex].classes[1])
        } else {
            contentChoice.classList.add(headerColumns[colIndex].classes[1])
        }

        HTML.filterContentList.appendChild(contentChoice);

        HTML.filterContentChoice[listIndex] = contentChoice;
    });

    addFilterContentOnClick(allSetsBoundary);
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
    if (selectedFilterHeader === -1) updateContentList(-1);
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
    selectedFilterHeader = -1;

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

function addFilterContentOnClick(allSetsBoundary) {
    HTML.filterContentChoice.forEach((value, index) => {
        value.addEventListener("mousedown", () => {
            let filterValue = contentList[index];
            headerStyles.forEach(value => HTML.filterContentInput.classList.remove(value))

            value.style.display = "none";

            if (selectedFilterHeader === -1) {
                let rColIndex = findrColIndex(index, allSetsBoundary);

                HTML.filterHeaderInput.value = headerNames[rColIndex];
                headerStyles.forEach(value => HTML.filterHeaderInput.classList.remove(value))
                HTML.filterHeaderInput.classList.add(headerColumns[rColIndex].classes[1]);

                selectedFilterHeader = rColIndex;
            }

            addFilterInput(filterValue, value);
        })
    });
} // Click Filter Content Choice

function addFilterInput(filterValue, choiceHTML) {
    selectedFilterContent.push(filterValue);
    const newInput = document.createElement("div");
    const newInputButton = document.createElement("div");

    newInput.innerHTML = filterValue;
    newInput.classList.add("filter-new-input", "no-scroll-bar");

    newInputButton.classList.add("filter-remove-button");
    newInputButton.textContent = "×";
    newInputButton.addEventListener("click", () => {
        HTML.filterContentNew.removeChild(newInput);
        selectedFilterContent.splice(selectedFilterContent.indexOf(filterValue), 1);
        if (selectedFilterContent.length === 0) HTML.filterContentNew.style.display = "none";
        choiceHTML.style.display = "block";
    })

    newInput.appendChild(newInputButton);
    HTML.filterContentNew.appendChild(newInput);
    HTML.filterContentNew.style.display = "flex";
} // Add Selected Filter Content

HTML.filterAddButton.addEventListener("click", () => {
    if (selectedFilterHeader == -1 || selectedFilterContent.length == 0) return;
    let newFilter = { header: selectedFilterHeader, filter: [...selectedFilterContent] };
    config.filter.push(newFilter);

    clearFilterHeader();
    clearFilterContent();
    addFilterDisplay(config.filter.lastIndexOf(newFilter));

    if (dataSheetData && firstRun) updateTable();
}) // Add Filter

function addFilterDisplay(filterNo) {
    const newFilter = config.filter[filterNo];
    const newContainer = document.createElement("div");
    const activeHeader = document.createElement("div");
    const activeHeaderTitle = document.createElement("span");
    const activeContent = document.createElement("div");
    const removeButton = document.createElement("div");

    activeHeaderTitle.innerHTML = `${filterNo + 1}. ${headerNames[newFilter.header]}`;
    activeHeader.classList.add("filter-active-header", headerColumns[newFilter.header].classes[1]);

    activeContent.innerHTML = `${newFilter.filter.join(", ")}`;
    activeContent.classList.add("filter-active-content", headerColumns[newFilter.header].classes[1]);

    removeButton.classList.add("filter-remove-button", headerColumns[newFilter.header].classes[1]);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
        HTML.filterActive.removeChild(newContainer);

        const realFilterNo = config.filter.indexOf(newFilter);
        HTML.filterActiveHeaderList.splice(realFilterNo, 1);
        config.filter.splice(realFilterNo, 1);

        if (HTML.filterActiveHeaderList.length > 0) {
            HTML.filterActiveHeaderList.forEach((header, index) => {
                header.textContent = `${index + 1}. ${headerNames[config.filter[index].header]}`;
            });
        }   

        if (dataSheetData && firstRun) updateTable();
    })

    activeHeader.appendChild(activeHeaderTitle);
    activeHeader.appendChild(removeButton);
    newContainer.appendChild(activeHeader);
    newContainer.appendChild(activeContent);

    HTML.filterActive.appendChild(newContainer);
    HTML.filterActiveHeaderList.push(activeHeaderTitle);

} // Add Active Filter Display

function findrColIndex(listIndex, allSetsBoundary) {
    let rColIndex;
    filterableHeaders.forEach((colIndex, fhIndex) => {
        if (listIndex <= allSetsBoundary[fhIndex] && 
            listIndex > ((fhIndex === 0) ? -1 : allSetsBoundary[fhIndex - 1])) {
                if (colIndex === 4 || colIndex === 5) {
                    rColIndex = 3;
                } else if (colIndex === 16) {
                    rColIndex = 15;
                } else {
                    rColIndex = colIndex;
                }
        }
    });
    return rColIndex;
}

function clearFilterHeader() {
    selectedFilterHeader = -1;
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
    if (headerColumns[index].isMerged) return;
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

// Sort ***
function sortTable(tbody, colIndex, asc = true) {
    if (colIndex === 0) return;

    let eColIndex = [];
    config.enabledColumns.forEach((enabled, colIndex) => {
        if (enabled) eColIndex.push(colIndex)
    });
    let rColIndex = eColIndex.indexOf(colIndex);
    let haformCol = eColIndex.indexOf(getColIndex("HA Formulary Class."));
    let tagCol = eColIndex.indexOf(getColIndex("Tags"));

    if (rColIndex === -1) return;

    const dirModifier = asc ? 1 : -1;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const drugNoContent = rows.map(row => row.cells[0].innerHTML);

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[rColIndex].textContent.trim();
        const cellB = rowB.cells[rColIndex].textContent.trim();

        const ANotInHK = tagCol !== -1 && haformCol !== -1 && checkNotInHK(rowA);
        const BNotInHK = tagCol !== -1 && haformCol !== -1 && checkNotInHK(rowB);

        const isEmpty = (cellA === "") || (cellB === "");
        if (ANotInHK || BNotInHK) {
            return ANotInHK === BNotInHK ? 0 : (ANotInHK === true ? 1 : -1);
        } else if (isEmpty) {
            return cellA === cellB ? 0 : (cellA === "" ? 1 : -1);
        } else {
            return cellA.localeCompare(cellB) * dirModifier;
        }
    });

    sortedRows.forEach((row, index) => {
        row.cells[0].innerHTML = drugNoContent[index];
        tbody.appendChild(row);
    });

    function checkNotInHK(row) {
        return row.cells[tagCol].textContent.includes("NR") && 
            (row.cells[haformCol].textContent === ("Not Listed"))
    }
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

// Misc
function getColIndex(colName, withNo = false) {
    let addCol = withNo? 1 : 0;
    return headerNames.indexOf(colName) + addCol;
}