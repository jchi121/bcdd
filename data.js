// Fixed Data
const headerColumns = [
    // Header Name, Header Classes, Header Filter-ability
    ["No.", ["w0", "basic", "drug-no"], false],
    ["Generic Name", ["w1f", "basic", "no-scroll"], false],
    ["Brand Name", ["w1", "basic"], false],

    ["Pharmacological Class", ["w1", "pharmc"], true],
    ["", ["w1", "pharmc"]],
    ["", ["w1", "pharmc"]],
    ["Add. Pharm. Class", ["w1", "pharmc"], false],
    
    ["Therapeutic Class", ["w3", "therap"], true],
    ["Indications", ["w3", "therap"], true],
    ["Affected Systems", ["w1", "therap"], true],

    ["Route of Administration", ["w2", "practuse"], true],
    ["Dosage", ["w2", "practuse"], false],
    ["Counseling Points", ["w2", "practuse"], true],
    ["Legal Classification", ["w2", "practuse"], true],

    ["Adverse Effects", ["w2", "practsafe"], true],
    ["", ["w2", "practsafe"]],
    ["Contraindications", ["w2", "practsafe"], true],
    ["Precautions", ["w2", "practsafe"], true],
    ["Drug Interactions", ["w2", "practsafe"], true],
    ["Food Interactions", ["w2", "practsafe"], true],
    ["Special Populations", ["w2", "practsafe"], true],
    ["Monitoring", ["w2", "practsafe"], true],

    ["Absorption", ["w1", "pk"], false],
    ["Distribution", ["w1", "pk"], false],
    ["Metabolism", ["w1", "pk"], true],
    ["Elimination", ["w1", "pk"], false],

    ["Notes", ["w1", "basic"], false], 
    ["Tags", ["w1", "basic"], true],
    ["Encounters", ["w1", "basic"], true],
];

const headerNames = [];
headerColumns.forEach((value) => {
    headerNames.push(value[0]);
});

// (Replace with Map method?)

const dataSheetAPIKey = "AIzaSyDFybl2Kxp4RMuCiT1fkTYJUImPfgK8s7g"; 
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

    filterHeaderInput: document.querySelector(".filter-input-header"),
    filterHeaderChoiceList: document.querySelector(".filter-header-list"),
    filterHeaderChoice: [],

    runButton: document.querySelector(".side-refresh button"),
};

const baseConfig = structuredClone(config);
