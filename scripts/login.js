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
 * Handles the login form submission and user authentication.
 * @param {Event} event - The form submit event.
 * @param {HTMLInputElement} emailInput - The email input field.
 * @param {HTMLInputElement} passwordInput - The password input field.
 */
function handleLogin(event, emailInput, passwordInput) {
  event.preventDefault();
  clearLoginErrors(emailInput, passwordInput);
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  if (!validateLoginInputs(emailInput, passwordInput, emailValue, passwordValue)) {
    return;
  }
  authenticateUser(emailValue, passwordValue, emailInput, passwordInput);
}

/**
 * Clears error messages for the login inputs.
 * @param {HTMLInputElement} emailInput - The email input field.
 * @param {HTMLInputElement} passwordInput - The password input field.
 */
function clearLoginErrors(emailInput, passwordInput) {
  removeError(emailInput);
  removeError(passwordInput);
}

/**
 * Validates the login inputs and displays error messages if necessary.
 * @param {HTMLInputElement} emailInput - The email input field.
 * @param {HTMLInputElement} passwordInput - The password input field.
 * @param {string} emailValue - The trimmed email value.
 * @param {string} passwordValue - The trimmed password value.
 * @returns {boolean} True if both inputs are valid, false otherwise.
 */
function validateLoginInputs(emailInput, passwordInput, emailValue, passwordValue) {
  let isValid = true;
    if (!validateEmail(emailValue)) {
    showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
    isValid = false;
  }
    if (passwordValue === '') {
    showError(passwordInput, 'Bitte ein Passwort eingeben.');
    isValid = false;
  }
    return isValid;
}


/**
 * Authenticates the user by fetching data from Firebase.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {HTMLInputElement} emailInput - The email input field.
 * @param {HTMLInputElement} passwordInput - The password input field.
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