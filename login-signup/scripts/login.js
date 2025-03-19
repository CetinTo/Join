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
