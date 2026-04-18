// ========== DOM ELEMENTS ==========
const modal = document.getElementById("modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const consentForm = document.getElementById("consent-form");
const modalText = document.getElementById("modal-text");
const declineBtn = document.getElementById("decline-btn");
const modalChoiceBtns = document.getElementById("modal-choice-btns");
const darkPatternWarning = document.getElementById("dark-pattern-warning");

let darkPatternTriggers = 0;
let sessionStartTime = Date.now();