// Fixed Data
const headerColumns = [
    ["No.", ["w0", "basic", "drug-no"]],
    ["Generic Name", ["w1f", "basic", "no-scroll"]],
    ["Brand Name", ["w1", "basic"]],

    ["Pharmacological Class", ["w1", "pharmc"]],
    ["", ["w1", "pharmc"]],
    ["", ["w1", "pharmc"]],
    ["Add. Pharm. Class", ["w1", "pharmc"]],
    
    ["Therapeutic Class", ["w3", "therap"]],
    ["Indications", ["w3", "therap"]],
    ["Affected Systems", ["w1", "therap"]],

    ["Route of Administration", ["w2", "practuse"]],
    ["Dosage", ["w2", "practuse"]],
    ["Counseling Points", ["w2", "practuse"]],
    ["Legal Classification", ["w2", "practuse"]],

    ["Adverse Effects", ["w2", "practsafe"]],
    ["", ["w2", "practsafe"]],
    ["Contraindications", ["w2", "practsafe"]],
    ["Precautions", ["w2", "practsafe"]],
    ["Drug Interactions", ["w2", "practsafe"]],
    ["Food Interactions", ["w2", "practsafe"]],
    ["Special Populations", ["w2", "practsafe"]],
    ["Monitoring", ["w2", "practsafe"]],

    ["Absorption", ["w1", "pk"]],
    ["Distribution", ["w1", "pk"]],
    ["Metabolism", ["w1", "pk"]],
    ["Elimination", ["w1", "pk"]],

    ["Notes", ["w1", "basic"]], 
    ["Tags", ["w1", "basic"]],
    ["Encounters", ["w1", "basic"]],
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
    runButton: document.querySelector(".side-refresh button"),
};

const baseConfig = structuredClone(config);
