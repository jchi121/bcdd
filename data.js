// Fixed Data
const headerColumns = [
    // Header Name, Header Classes, Header Filter-ability
    {
        name: "No.", // 0
        classes: ["w0", "basic", "drug-no"],
        isFilterable: false,
    },
    {
        name: "Generic Name", // 1
        classes: ["w1f", "basic", "no-scroll"],
        isFilterable: false,
    },
    {
        name: "Brand Name", // 2
        classes: ["w1", "basic"],
        isFilterable: false,
    },

    {
        name: "Pharmacological Class", // 3
        classes: ["w1", "pharmc"],
        isFilterable: true,
    },
    {
        name: "", // 4
        classes: ["w1", "pharmc"],
        isFilterable: false,
    },
    {
        name: "", // 5
        classes: ["w1", "pharmc"],
        isFilterable: false,
    },
    {
        name: "Add. Pharm. Class", // 6
        classes: ["w1", "pharmc"],
        isFilterable: false,
    },

    {
        name: "Therapeutic Class", // 7
        classes: ["w3", "therap"],
        isFilterable: true,
    },
    {
        name: "Indications", // 8
        classes: ["w3", "therap"],
        isFilterable: true,
    },
    {
        name: "Affected Systems", // 9
        classes: ["w1", "therap"],
        isFilterable: true,
    },

    {
        name: "Route of Administration", // 10
        classes: ["w2", "practuse"],
        isFilterable: true,
    },
    {
        name: "Dosage", // 11
        classes: ["w2", "practuse"],
        isFilterable: false,
    },
    {
        name: "Counseling Points", // 12
        classes: ["w2", "practuse"],
        isFilterable: true,
    },
    {
        name: "Legal Classification", // 13
        classes: ["w2", "practuse"],
        isFilterable: true,
    },

    {
        name: "Adverse Effects", // 13
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "", // 14
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Contraindications", // 15
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Precautions", // 16
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Drug Interactions", // 17
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Food Interactions", // 18
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Special Populations", // 19
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },
    {
        name: "Monitoring", // 20
        classes: ["w2", "practsafe"],
        isFilterable: true,
    },

    {
        name: "Absorption", // 21
        classes: ["w1", "pk"],
        isFilterable: false,
    },
    {
        name: "Distribution", // 22
        classes: ["w1", "pk"],
        isFilterable: false,
    },
    {
        name: "Metabolism", // 23
        classes: ["w1", "pk"],
        isFilterable: true,
    },
    {
        name: "Elimination", // 24
        classes: ["w1", "pk"],
        isFilterable: false,
    },

    {
        name: "Notes", // 25
        classes: ["w1", "basic"],
        isFilterable: false,
    },
    {
        name: "Tags", // 26
        classes: ["w1", "basic"],
        isFilterable: true,
    },
    {
        name: "Encounters", // 27
        classes: ["w1", "basic"],
        isFilterable: true,
    },
];

const headerNames = [];
headerColumns.forEach((value) => {
    headerNames.push(value.name);
});

const headerStyles = ["basic", "pharmc", "therap", "practuse", "practsafe", "pk"];

// (Replace with Map method?)

const dataSheetAPIKey = ""; 
const dataSheetId = "1bh0Jr6vpKCfaO8c30WHx2nat-NidhI7qNJ963TFgSpY";
const dataSheetRange = encodeURIComponent("Drugs!A:AB");
const dataSheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${dataSheetId}/values/${dataSheetRange}?key=${dataSheetAPIKey}`;

const HTML = {
    thead: document.querySelector(".main-table thead"),
    tbody: document.querySelector(".main-table tbody"),
    intro: document.querySelector(".intro"),

    searchDrug: document.querySelector(".search-drug.search-input"),
    searchGen: document.querySelector(".search-gen.search-input"),

    visiBox: document.querySelector(".visibility-box"),
    visiBoxName: [],
    visiBoxButton: [],
    visiDefaultButton: document.querySelector(".visibility-button"),

    filterAddHeader: document.querySelector(".filter-add-box"),
    filterHeaderInput: document.querySelector(".filter-input-header"),
    filterHeaderList: document.querySelector(".filter-header-list"),
    filterHeaderChoice: [],
    filterContentInput: document.querySelector(".filter-input-content"),
    filterContentList: document.querySelector(".filter-content-list"),
    filterContentNew: document.querySelector(".filter-add-box > div:nth-child(2)"),
    filterContentChoice: [],

    runButton: document.querySelector(".side-refresh button"),
};

const baseConfig = structuredClone(config);
