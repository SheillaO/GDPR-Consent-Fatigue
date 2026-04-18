# ConsentVault - Personal GDPR Consent Manager

> *"Track the trackers. Manage your digital consent in one place."*

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://gdprconsentfatigue.netlify.app/)

---
## 🎯 The Problem

**GDPR Consent Fatigue** is killing digital privacy.

- **97% of users** blindly click "Accept All" without reading
- Average person sees **50+ cookie banners daily**
- **Dark patterns** (deceptive UX) trick users into oversharing data
- **Zero tracking** of what you've actually consented to across sites

### The $7.8B Impact
The GDPR compliance market is worth $7.8 billion (2024), yet users have no simple way to track what they've agreed to or revoke consent across platforms.

---

## 💡 The Solution

**ConsentVault** is a personal consent manager that:

✅ **Tracks all your consents** - Never wonder what you agreed to  
✅ **Detects dark patterns** - See when sites use deceptive UX  
✅ **Centralized management** - Revoke consent from one dashboard  
✅ **GDPR education** - Learn what data you're actually sharing  

---

## 🚀 Features

### 1. **Consent Logging**
Every time you accept a cookie banner, ConsentVault records:
- Website name
- Email address
- Consent types (Marketing, Analytics)
- Date of consent
- Whether dark patterns were used

### 2. **Dark Pattern Detection**
Automatically detects when sites use tricks like:
- Moving "Decline" buttons on hover
- Pre-checked boxes
- Confusing double negatives

### 3. **Consent Revocation**
- Revoke individual consents
- Bulk-revoke all consents at once
- LocalStorage-based (your data stays on your device)

### 4. **Privacy Dashboard**
See all your active consents in one place with:
- Website names
- Data types shared
- Consent dates
- Dark pattern flags

---


### Core Technologies
- **HTML5** - Semantic structure
- **CSS3** - Clean, accessible design
- **Vanilla JavaScript** - No frameworks, pure JS
- **LocalStorage API** - Client-side data persistence

### Key JavaScript Functions

```javascript
// Save consent to localStorage
function saveConsent(consentData) {
    let consents = JSON.parse(localStorage.getItem('consents')) || []
    consents.push(consentData)
    localStorage.setItem('consents', JSON.stringify(consents))
}

// Detect dark patterns
declineBtn.addEventListener('mouseenter', function(){
    modalChoiceBtns.classList.toggle('modal-btns-reverse')
    darkPatternWarning.style.display = 'block'
})

// Revoke consent
function deleteConsent(index) {
    let consents = getConsents()
    consents.splice(index, 1)
    localStorage.setItem('consents', JSON.stringify(consents))
    renderConsentHistory()
}
```