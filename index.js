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

