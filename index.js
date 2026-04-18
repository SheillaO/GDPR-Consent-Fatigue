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

function trackEvent(eventName, data = {}) {
  const event = {
    name: eventName,
    timestamp: new Date().toISOString(),
    sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
    ...data,
  };

  let analytics = JSON.parse(localStorage.getItem("analytics")) || [];
  analytics.push(event);
  localStorage.setItem("analytics", JSON.stringify(analytics));

  console.log("📊 Event tracked:", event);
}

// ========== MODAL BEHAVIOR ==========
setTimeout(function(){
    modal.style.display = 'inline'
    trackEvent('modal_shown', { delay: 1500 })
}, 1500)

modalCloseBtn.addEventListener('click', function(){
    modal.style.display = 'none'
    trackEvent('modal_closed', { method: 'close_button' })
}) 

// ========== DARK PATTERN DETECTION ==========
declineBtn.addEventListener('mouseenter', function(){
    modalChoiceBtns.classList.toggle('modal-btns-reverse')
    darkPatternTriggers++
    
    darkPatternWarning.style.display = 'block'
    trackEvent('dark_pattern_triggered', { 
        triggerCount: darkPatternTriggers,
        buttonMoved: true
    })
    
    setTimeout(function(){
        darkPatternWarning.style.display = 'none'
    }, 3000)
}) 


// ========== CONSENT FORM SUBMISSION ==========
consentForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const consentFormData = new FormData(consentForm);
  const websiteName = consentFormData.get("websiteName");
  const email = consentFormData.get("email");
  const marketing = consentFormData.get("marketing") ? "Yes" : "No";
  const analytics = consentFormData.get("analytics") ? "Yes" : "No";

  // Calculate risk score
  const riskScore = calculateRiskScore(
    marketing,
    analytics,
    darkPatternTriggers,
  );

  // Save consent
  const consentData = {
    website: websiteName,
    email: email,
    marketing: marketing,
    analytics: analytics,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    darkPatternUsed: modalChoiceBtns.classList.contains("modal-btns-reverse"),
    darkPatternTriggers: darkPatternTriggers,
    riskScore: riskScore,
  };

  saveConsent(consentData);
  trackEvent("consent_accepted", consentData);

  // Show loading sequence
  showLoadingSequence(websiteName, riskScore);
});

/ ========== LOADING SEQUENCE ==========
function showLoadingSequence(websiteName, riskScore) {
    modalText.innerHTML = `
    <div class="modal-inner-loading">
        <img src="images/loading.svg" class="loading">
        <p id="upload-text">Saving your consent...</p>
    </div>` 
    
    setTimeout(function(){
        document.getElementById('upload-text').innerText = 'Analyzing privacy risks...'
    }, 1000)
    
    setTimeout(function(){
        document.getElementById('upload-text').innerText = 'Recording dark patterns...'
    }, 2000)
    
    setTimeout(function(){
        document.getElementById('modal-inner').innerHTML = `
        <h2>Consent Logged ✅</h2>
        <p>We tracked <span class="modal-display-name">${websiteName}</span></p>
        ${darkPatternTriggers > 0 ? 
            `<p class="warning-text">⚠️ ${darkPatternTriggers} dark pattern(s) detected!</p>` : 
            '<p class="success-text">✓ No dark patterns detected</p>'
        }
        <p class="risk-score">Risk Score: <strong>${riskScore}/100</strong></p>
        <p class="info-text">Check your consent history below to manage this.</p>
        `
        modalCloseBtn.disabled = false
        renderConsentHistory()
        updateDashboardStats()
    }, 3000)
}

// ========== RISK SCORE CALCULATION ==========
function calculateRiskScore(marketing, analytics, darkPatterns) {
    let score = 0
    
    if (marketing === 'Yes') score += 30
    if (analytics === 'Yes') score += 20
    score += darkPatterns * 15
    
    return Math.min(score, 100)
}

// ========== CONSENT MANAGEMENT ==========
function saveConsent(consentData) {
    let consents = getConsents()
    consents.push(consentData)
    localStorage.setItem('consents', JSON.stringify(consents))
}

function getConsents() {
    return JSON.parse(localStorage.getItem('consents')) || []
}

function deleteConsent(index) {
    let consents = getConsents()
    const deleted = consents.splice(index, 1)[0]
    localStorage.setItem('consents', JSON.stringify(consents))
    
    trackEvent('consent_revoked', { website: deleted.website })
    renderConsentHistory()
    updateDashboardStats()
}

