// Fixed Data
const headerColumns = [
    // Header Name, Header Classes, Header Filter-ability
    {
        name: "No.", // 0
        classes: ["w0", "basic", "drug-no"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Generic Name", // 1
        classes: ["w1f", "basic", "no-scroll"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Brand Name", // 2
        classes: ["w1", "basic"],
        isFilterable: false,
        isMerged: false,
    },

    {
        name: "Pharmacological Class", // 3
        classes: ["w1", "pharmc"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Pharm. Subclass 1", // 4
        classes: ["w1", "pharmc", "no-leftb"],
        isFilterable: true,
        isMerged: true,
    },
    {
        name: "Pharm. Subclass 2", // 5
        classes: ["w1", "pharmc", "no-leftb"],
        isFilterable: true,
        isMerged: true,
    },
    {
        name: "Add. Pharm. Class", // 6
        classes: ["w1", "pharmc"],
        isFilterable: true,
        isMerged: false,
    },

    {
        name: "Therapeutic Class", // 7
        classes: ["w3", "therap"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Indications", // 8
        classes: ["w3", "therap"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Affected Systems", // 9
        classes: ["w1", "therap"],
        isFilterable: true,
        isMerged: false,
    },

    {
        name: "Route of Administration", // 10
        classes: ["w2", "practuse"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Dosage", // 11
        classes: ["w2", "practuse"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Counseling Points", // 12
        classes: ["w2", "practuse"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Legal Classification", // 13
        classes: ["w2", "practuse"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "HA Formulary Class.", // 14
        classes: ["w2", "practuse"],
        isFilterable: true,
        isMerged: false,
    },

    {
        name: "Adverse Effects", // 15
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Adverse Effects 2", // 16
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: true,
    },
    {
        name: "Contraindications", // 17
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Precautions", // 18
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Drug Interactions", // 19
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Food Interactions", // 20
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Special Populations", // 21
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Monitoring", // 22
        classes: ["w2", "practsafe"],
        isFilterable: true,
        isMerged: false,
    },

    {
        name: "Absorption", // 23
        classes: ["w1", "pk"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Distribution", // 24
        classes: ["w1", "pk"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Metabolism", // 25
        classes: ["w1", "pk"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Elimination", // 26
        classes: ["w1", "pk"],
        isFilterable: false,
        isMerged: false,
    },

    {
        name: "Notes", // 27
        classes: ["w1", "basic"],
        isFilterable: false,
        isMerged: false,
    },
    {
        name: "Tags", // 28
        classes: ["w1", "basic"],
        isFilterable: true,
        isMerged: false,
    },
    {
        name: "Encounters", // 29
        classes: ["w1", "basic"],
        isFilterable: true,
        isMerged: false,
    },
];

const headerNames = [];
headerColumns.forEach(value => headerNames.push(value.name));

const filterableHeaders = [];
headerColumns.forEach((value, index) => {
    if (value.isFilterable === false) return;
    filterableHeaders.push(index);
});

const headerStyles = ["basic", "pharmc", "therap", "practuse", "practsafe", "pk"];

const dataSheetUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_ksRb3jqkaafwes-AjRmFrFyzj8T2iTP6EGsE96NvBaUQI6hi4iTQaXkwE1tNr4N3SbOtHC-9hp7L/pub?gid=0&single=true&output=csv`;

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

    filterActive: document.querySelector(".filter-active-box"),
    filterActiveHeaderList: [],
    filterAddHeader: document.querySelector(".filter-add-box"),
    filterHeaderInput: document.querySelector(".filter-input-header"),
    filterHeaderList: document.querySelector(".filter-header-list"),
    filterHeaderChoice: [],
    filterContentInput: document.querySelector(".filter-input-content"),
    filterContentList: document.querySelector(".filter-content-list"),
    filterContentNew: document.querySelector(".filter-add-box > div:nth-child(2)"),
    filterContentChoice: [],
    filterAddButton: document.querySelector(".filter-add-button"),

    runButton: document.querySelector(".side-refresh button"),
};

const baseConfig = structuredClone(config);
