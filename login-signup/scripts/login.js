// Globale Hilfsfunktion zum Schließen der Modals
function closeModals() {
  const privacyModal = document.getElementById('privacyPolicyModal');
  const legalModal = document.getElementById('legalNoticeModal');
  
  if (privacyModal) privacyModal.style.display = 'none';
  if (legalModal) legalModal.style.display = 'none';
  
  document.body.style.overflow = 'auto';
}

// Warte bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM geladen, initialisiere Event-Listener');
  
  // Login-Formular-Validierung
  initLoginForm();
  
  // Modal-Links initialisieren
  initModalLinks();
  
  // Modals bei Klick außerhalb schließen
  initModalOutsideClickHandlers();
});

// Initialisiert die Modal-Links
function initModalLinks() {
  // Links zwischen den Modals
  setupModalLink('privacyFooterLink', 'privacyPolicyModal', 'legalNoticeModal');
  setupModalLink('legalFooterLink', 'legalNoticeModal', 'privacyPolicyModal');
  setupModalLink('privacyFooterLink2', 'privacyPolicyModal', 'legalNoticeModal');
  setupModalLink('legalFooterLink2', 'legalNoticeModal', 'privacyPolicyModal');
}

// Richtet einen einzelnen Modal-Link ein
function setupModalLink(linkId, showModalId, hideModalId) {
  const link = document.getElementById(linkId);
  if (!link) return;
  
  link.onclick = function(e) {
    e.preventDefault();
    document.getElementById(showModalId).style.display = 'block';
    document.getElementById(hideModalId).style.display = 'none';
    document.body.style.overflow = 'hidden';
    return false;
  };
}

// Initialisiert Klick-Handler außerhalb der Modals
function initModalOutsideClickHandlers() {
  const privacyModal = document.getElementById('privacyPolicyModal');
  const legalModal = document.getElementById('legalNoticeModal');
  
  window.addEventListener('click', function(e) {
    if (e.target === privacyModal) {
      privacyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    if (e.target === legalModal) {
      legalModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

// Initialisiert die Login-Formular-Validierung
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  loginForm.noValidate = true;

  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      removeError(emailInput);
      if (!emailInput.value) {
        showError(emailInput, 'Email is required');
      } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('blur', function() {
      removeError(passwordInput);
      if (!passwordInput.value) {
        showError(passwordInput, 'Password is required');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      
      // Email validation
      if (!emailInput.value) {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
      } else {
        removeError(emailInput);
      }
      
      // Password validation
      if (!passwordInput.value) {
        showError(passwordInput, 'Password is required');
        isValid = false;
      } else {
        removeError(passwordInput);
      }
      
      if (isValid) {
        // Hier würde normalerweise die Login-Logik stehen
        window.location.href = '../index.html';
      }
    });
  }
}

// Hilfsfunktionen für die Validierung
function showError(input, message) {
  const formControl = input.parentElement;
  const errorSpan = formControl.querySelector('.error-message');
  
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
  }
  
  input.classList.add('input-error');
}

function removeError(input) {
  const formControl = input.parentElement;
  const errorSpan = formControl.querySelector('.error-message');
  
  if (errorSpan) {
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
  }
  
  input.classList.remove('input-error');
}

function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
