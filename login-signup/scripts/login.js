document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  loginForm.noValidate = true;

  emailInput.addEventListener('blur', () => {
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    if (emailValue !== '' && !validateEmail(emailValue)) {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/users.json');
      const users = await response.json();
      
      let foundUser = null;
      
      // Suche nach dem Benutzer
      for (let key in users) {
        const user = users[key];
        if (user.email === email && user.password === password) {
          foundUser = user;
          break;
        }
      }
      
      if (foundUser) {
        // Login erfolgreich
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        window.location.href = '../index.html';
      } else {
        // Login fehlgeschlagen
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Email or password is incorrect';
        
        // Alte Fehlermeldung entfernen
        const oldError = document.querySelector('.error-message');
        if (oldError) {
          oldError.remove();
        }
        
        // Neue Fehlermeldung nach dem Passwort-Input einfügen
        const passwordInput = document.getElementById('password');
        passwordInput.parentNode.appendChild(errorDiv);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again.');
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(inputElement, message) {
    inputElement.classList.add('input-error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerText = message;
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
  }

  function removeError(inputElement) {
    inputElement.classList.remove('input-error');
    const nextElem = inputElement.nextSibling;
    if (nextElem && nextElem.classList && nextElem.classList.contains('error-message')) {
      nextElem.remove();
    }
  }
});
