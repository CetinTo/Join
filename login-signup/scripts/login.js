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

<<<<<<< HEAD
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
=======
  passwordInput.addEventListener('blur', () => {
    removeError(passwordInput);
    const passwordValue = passwordInput.value.trim();
    if (passwordValue === '') {
      showError(passwordInput, 'Bitte ein Passwort eingeben.');
    }
  });

  loginForm.addEventListener('submit', handleLogin);

  function handleLogin(event) {
    event.preventDefault();
    removeError(emailInput);
    removeError(passwordInput);

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    let hasError = false;

    if (!validateEmail(emailValue)) {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
      hasError = true;
    }
    if (passwordValue === '') {
      showError(passwordInput, 'Bitte ein Passwort eingeben.');
      hasError = true;
    }
    if (hasError) return;

    fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
      .then(response => response.json())
      .then(data => {
        let userByEmail = null;
        for (let key in data) {
          const user = data[key];
          if (user.email === emailValue) {
            userByEmail = user;
            break;
          }
        }
        if (!userByEmail) {
          showError(emailInput, 'E-Mail ist falsch.');
        } else if (userByEmail.password !== passwordValue) {
          showError(passwordInput, 'Passwort ist falsch.');
        } else {
          localStorage.setItem('currentUser', JSON.stringify(userByEmail));
          window.location.href = '../index.html';
        }
      })
      .catch(error => {
        console.error(error);
        alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
      });
  }
>>>>>>> cfdc28f5305251a4df06a42779b6dfe2f2d56a99

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
