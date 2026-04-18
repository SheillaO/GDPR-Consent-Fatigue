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

// ========== SEARCH & FILTER ==========
function searchConsents(query) {
    const consents = getConsents()
    const filtered = consents.filter(consent => 
        consent.website.toLowerCase().includes(query.toLowerCase()) ||
        consent.email.toLowerCase().includes(query.toLowerCase())
    )
    
    trackEvent('search_performed', { query: query, results: filtered.length })
    return filtered
}

function filterByRisk(minScore) {
    const consents = getConsents()
    return consents.filter(consent => consent.riskScore >= minScore)
}

function filterByDarkPatterns() {
    const consents = getConsents()
    return consents.filter(consent => consent.darkPatternUsed)
}

// ========== SORTING ==========
function sortConsents(sortBy) {
    const consents = getConsents()
    
    switch(sortBy) {
        case 'date-new':
            return consents.reverse()
        case 'date-old':
            return consents
        case 'risk-high':
            return consents.sort((a, b) => b.riskScore - a.riskScore)
        case 'risk-low':
            return consents.sort((a, b) => a.riskScore - b.riskScore)
        default:
            return consents
    }
}

// ========== EXPORT FUNCTIONALITY ==========
function exportAsJSON() {
    const consents = getConsents()
    const dataStr = JSON.stringify(consents, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `consents-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    trackEvent('export_json', { count: consents.length })
}

function exportAsCSV() {
    const consents = getConsents()
    
    if (consents.length === 0) {
        alert('No consents to export!')
        return
    }
    
    const headers = ['Website', 'Email', 'Marketing', 'Analytics', 'Date', 'Risk Score', 'Dark Patterns']
    const rows = consents.map(c => [
        c.website,
        c.email,
        c.marketing,
        c.analytics,
        c.date,
        c.riskScore,
        c.darkPatternTriggers
    ])
    
    const csv = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `consents-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    trackEvent('export_csv', { count: consents.length })
}

// ========== DASHBOARD STATS ==========
function updateDashboardStats() {
    const consents = getConsents()
    
    if (consents.length === 0) {
        document.getElementById('total-consents').textContent = '0'
        document.getElementById('dark-patterns-count').textContent = '0'
        document.getElementById('avg-risk-score').textContent = '0'
        document.getElementById('high-risk-count').textContent = '0'
        return
    }
    
    const darkPatternCount = consents.filter(c => c.darkPatternUsed).length
    const avgRisk = Math.round(consents.reduce((sum, c) => sum + c.riskScore, 0) / consents.length)
    const highRiskCount = consents.filter(c => c.riskScore >= 60).length
    
    document.getElementById('total-consents').textContent = consents.length
    document.getElementById('dark-patterns-count').textContent = darkPatternCount
    document.getElementById('avg-risk-score').textContent = avgRisk
    document.getElementById('high-risk-count').textContent = highRiskCount
}

