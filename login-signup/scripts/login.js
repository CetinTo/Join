document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  loginForm.noValidate = true;

  emailInput.addEventListener('blur', () => {
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    if (!validateEmail(emailValue) && emailValue !== '') {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
    }
  });

  loginForm.addEventListener('submit', handleLogin);

  function handleLogin(event) {
    event.preventDefault();
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    const passwordValue = document.getElementById('password').value;
    if (!validateEmail(emailValue)) {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
      .then(response => response.json())
      .then(data => {
        let foundUser = null;
        for (let key in data) {
          const user = data[key];
          if (user.email === emailValue && user.password === passwordValue) {
            foundUser = user;
            break;
          }
        }
        if (foundUser) {
          localStorage.setItem('currentUser', JSON.stringify(foundUser));
          window.location.href = '../index.html';
        } else {
          showError(emailInput, 'E-Mail oder Passwort ist falsch.');
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
