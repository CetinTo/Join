/**
 * Sobald die Seite geladen ist, werden die Event-Listener hinzugefügt
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login-Script geladen - Event-Listener werden eingerichtet');
    
    // Einfacher Event-Listener für alle Footer-Links
    const allLinks = document.querySelectorAll('a');
    
    allLinks.forEach(link => {
        // Privacy Policy Links
        if (link.textContent.includes('Privacy Policy') || 
            link.textContent.includes('Datenschutz') || 
            link.textContent.includes('privacy')) {
            
            link.onclick = function(e) {
                e.preventDefault();
                console.log('Privacy Policy Link geklickt');
                openPrivacyModal();
                return false;
            };
        }
        
        // Legal Notice Links
        if (link.textContent.includes('Legal Notice') || 
            link.textContent.includes('Legal notice') || 
            link.textContent.includes('Impressum') || 
            link.textContent.includes('legal')) {
            
            link.onclick = function(e) {
                e.preventDefault();
                console.log('Legal Notice Link geklickt');
                openLegalModal();
                return false;
            };
        }
    });
    
    // Zusätzlich direkter Zugriff auf die Footer-Links
    const footerLinks = document.querySelectorAll('.footer a');
    footerLinks.forEach(link => {
        if (link.textContent.includes('Privacy')) {
            console.log('Footer Privacy Link gefunden');
            link.onclick = function(e) {
                e.preventDefault();
                openPrivacyModal();
                return false;
            };
        } else if (link.textContent.includes('Legal')) {
            console.log('Footer Legal Link gefunden');
            link.onclick = function(e) {
                e.preventDefault();
                openLegalModal();
                return false;
            };
        }
    });
    
    // Close-Button Event-Listener
    const closeButtons = document.querySelectorAll('.login-button');
    closeButtons.forEach(button => {
        button.onclick = function(e) {
            e.preventDefault();
            closeModals();
            return false;
        };
    });
});

/**
 * Öffnet das Privacy Policy Modal und schließt das Legal Notice Modal
 */
function openPrivacyModal() {
    console.log('Privacy Modal wird geöffnet');
    
    // Erst beide Modals schließen
    const privacyModal = document.getElementById('privacyPolicyModal');
    const legalModal = document.getElementById('legalNoticeModal');
    
    if (privacyModal) privacyModal.style.display = 'none';
    if (legalModal) legalModal.style.display = 'none';
    
    // Dann das Privacy Modal öffnen
    if (privacyModal) {
        document.body.classList.add('modal-open');
        privacyModal.style.display = 'block';
        
        // Aktiven Link markieren
        updateActiveModalLinks('privacy');
    } else {
        console.error('Privacy Modal nicht gefunden!');
    }
    
    return false;
}

/**
 * Öffnet das Legal Notice Modal und schließt das Privacy Policy Modal
 */
function openLegalModal() {
    console.log('Legal Modal wird geöffnet');
    
    // Erst beide Modals schließen
    const privacyModal = document.getElementById('privacyPolicyModal');
    const legalModal = document.getElementById('legalNoticeModal');
    
    if (privacyModal) privacyModal.style.display = 'none';
    if (legalModal) legalModal.style.display = 'none';
    
    // Dann das Legal Modal öffnen
    if (legalModal) {
        document.body.classList.add('modal-open');
        legalModal.style.display = 'block';
        
        // Aktiven Link markieren
        updateActiveModalLinks('legal');
    } else {
        console.error('Legal Modal nicht gefunden!');
    }
    
    return false;
}

/**
 * Schließt alle Modals
 */
function closeModals() {
    console.log('Modals werden geschlossen');
    const privacyModal = document.getElementById('privacyPolicyModal');
    const legalModal = document.getElementById('legalNoticeModal');
    
    if (privacyModal) privacyModal.style.display = 'none';
    if (legalModal) legalModal.style.display = 'none';
    
    document.body.classList.remove('modal-open');
    return false;
}

// Wenn die Seite fertig geladen ist, die Funktionen global verfügbar machen
window.openPrivacyModal = openPrivacyModal;
window.openLegalModal = openLegalModal;
window.closeModals = closeModals;

/**
 * Verarbeitet den Login-Vorgang
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Hier kann die eigentliche Login-Logik implementiert werden
    console.log('Login versucht mit:', email);
    
    // Fügen Sie hier Ihre Authentifizierungslogik ein
    
    // Beispiel für Weiterleitung nach erfolgreicher Anmeldung
    // window.location.href = '../index.html';
}

// Wenn die Seite neu geladen wird, stellen wir sicher, dass alle Modals geschlossen sind
window.onload = function() {
    closeModals();
};

// Event-Listener für die Modal-Links hinzufügen
document.addEventListener('DOMContentLoaded', function() {
  // Modal-Funktionen einrichten
  setupModalLinks();
  
  // Rest des bestehenden DOMContentLoaded-Codes...
});

// Funktion zum Einrichten der Modal-Links
function setupModalLinks() {
  // Privacy Policy Links - nur valide CSS-Selektoren verwenden
  const privacyLinks = document.querySelectorAll('a[onclick*="openPrivacyModal"]');
  privacyLinks.forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      openPrivacyModal();
      return false;
    };
  });
  
  // Zusätzlich Links mit dem Text "Privacy Policy" finden
  document.querySelectorAll('a').forEach(link => {
    if (link.textContent.includes('Privacy Policy')) {
      link.onclick = function(e) {
        e.preventDefault();
        openPrivacyModal();
        return false;
      };
    }
  });
  
  // Legal Notice Links - nur valide CSS-Selektoren verwenden
  const legalLinks = document.querySelectorAll('a[onclick*="openLegalModal"]');
  legalLinks.forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      openLegalModal();
      return false;
    };
  });
  
  // Zusätzlich Links mit dem Text "Legal Notice" finden
  document.querySelectorAll('a').forEach(link => {
    if (link.textContent.includes('Legal Notice') || link.textContent.includes('Legal notice')) {
      link.onclick = function(e) {
        e.preventDefault();
        openLegalModal();
        return false;
      };
    }
  });
  
  // Close-Buttons in den Modals
  const closeButtons = document.querySelectorAll('.login-button, .close-modal');
  closeButtons.forEach(button => {
    button.onclick = function(e) {
      e.preventDefault();
      closeModals();
      return false;
    };
  });
}

// Hilfsfunktion zum Aktualisieren der aktiven Links
function updateActiveModalLinks(type) {
    const allModalLinks = document.querySelectorAll('.legal-modal-footer a:not(.login-button)');
    
    allModalLinks.forEach(link => {
        // Aktive Klasse entfernen
        link.classList.remove('active');
        
        // Aktive Klasse entsprechend setzen
        if (type === 'privacy' && link.textContent.includes('Privacy')) {
            link.classList.add('active');
        } else if (type === 'legal' && (link.textContent.includes('Legal') || link.textContent.includes('Impressum'))) {
            link.classList.add('active');
        }
    });
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  // Direktes Hinzufügen von Event-Listenern zu den spezifischen Links
  const footerLinks = document.querySelectorAll('.footer a');
  footerLinks.forEach(link => {
    if (link.textContent.includes('Privacy')) {
      link.onclick = window.openPrivacyModal;
    } else if (link.textContent.includes('Legal')) {
      link.onclick = window.openLegalModal;
    }
  });
  
  // Event-Listener für die Modal-Footer-Links
  const modalFooterLinks = document.querySelectorAll('.legal-modal-footer a');
  modalFooterLinks.forEach(link => {
    if (link.textContent.includes('Privacy')) {
      link.onclick = window.openPrivacyModal;
    } else if (link.textContent.includes('Legal')) {
      link.onclick = window.openLegalModal;
    } else if (link.classList.contains('login-button')) {
      link.onclick = window.closeModals;
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
  
    loginForm.noValidate = true;
  
    emailInput.addEventListener('blur', () => handleEmailValidation(emailInput));
    passwordInput.addEventListener('blur', () => handlePasswordValidation(passwordInput));
    loginForm.addEventListener('submit', (event) => handleLogin(event, emailInput, passwordInput));
  });
  
  /**
   * Handles email field validation on blur event.
   * @param {HTMLInputElement} emailInput - The email input field.
   */
  function handleEmailValidation(emailInput) {
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    if (emailValue !== '' && !validateEmail(emailValue)) {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
    }
  }
  
  /**
   * Handles password field validation on blur event.
   * @param {HTMLInputElement} passwordInput - The password input field.
   */
  function handlePasswordValidation(passwordInput) {
    removeError(passwordInput);
    const passwordValue = passwordInput.value.trim();
    if (passwordValue === '') {
      showError(passwordInput, 'Bitte ein Passwort eingeben.');
    }
  }
  
  /**
   * Authenticates the user by checking Firebase for matching credentials.
   * @param {string} email - The entered email.
   * @param {string} password - The entered password.
   * @param {HTMLInputElement} emailInput - The email input element.
   * @param {HTMLInputElement} passwordInput - The password input element.
   */
  function authenticateUser(email, password, emailInput, passwordInput) {
    const dbUrl = 'https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';
  
    fetch(dbUrl)
      .then(response => response.json())
      .then(data => {
        const user = findUserByEmail(data, email);
        if (!user) {
          showError(emailInput, 'E-Mail ist falsch.');
        } else if (user.password !== password) {
          showError(passwordInput, 'Passwort ist falsch.');
        } else {
          loginUser(user);
        }
      })
      .catch(error => {
        console.error(error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      });
  }
  
  /**
   * Searches for a user in the Firebase data by email.
   * @param {Object} data - The Firebase data object.
   * @param {string} email - The email to search for.
   * @returns {Object|null} The matched user or null if not found.
   */
  function findUserByEmail(data, email) {
    for (let key in data) {
      const user = data[key];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }
  
  /**
   * Stores the logged-in user in localStorage and redirects to the homepage.
   * @param {Object} user - The authenticated user object.
   */
  function loginUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = '../index.html';
  }
  
  /**
   * Validates if the given string is a valid email format.
   * @param {string} email - The email string to validate.
   * @returns {boolean} True if valid, false otherwise.
   */
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  /**
   * Displays an error message below the input element.
   * @param {HTMLElement} inputElement - The input to show error for.
   * @param {string} message - The error message text.
   */
  function showError(inputElement, message) {
    inputElement.classList.add('input-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerText = message;
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
  }
  
  /**
   * Removes the error message from the input element if it exists.
   * @param {HTMLElement} inputElement - The input element to clear errors from.
   */
  function removeError(inputElement) {
    inputElement.classList.remove('input-error');
    const nextElem = inputElement.nextSibling;
    if (nextElem && nextElem.classList && nextElem.classList.contains('error-message')) {
      nextElem.remove();
    }
  }