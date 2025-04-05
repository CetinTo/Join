/**
 * Global variables for the sign-up form.
 * @type {HTMLFormElement}
 */
let form, submitBtn, checkbox, emailInput, passwordInputs;

/**
 * Initializes the sign-up form when the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  form = document.getElementById("loginForm");
  submitBtn = form.querySelector(".btn.sign-up-btn");
  checkbox = form.querySelector('input[type="checkbox"]');
  emailInput = form.querySelector(".input-email");
  passwordInputs = form.querySelectorAll(".icon-lock");

  initForm();
});


/**
 * Initializes the sign-up form functionality.
 */
function initForm() {
  submitBtn.disabled = true;
  form.addEventListener("input", checkFormValidity);
  checkbox.addEventListener("change", checkFormValidity);
  initEmailValidation(emailInput);
  initPasswordValidation(passwordInputs);
  form.addEventListener("submit", signUp);
}

/**
 * Sets up email validation on blur event.
 * @param {HTMLElement} emailInput - The email input element.
 */
function initEmailValidation(emailInput) {
  emailInput.addEventListener("blur", () => {
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    if (emailValue !== "" && !validateEmail(emailValue)) {
      showError(emailInput, "Bitte eine gültige E-Mail-Adresse eingeben.");
    }
  });
}

/**
 * Sets up password validation on input and blur events.
 * @param {NodeListOf<HTMLElement>} passwordInputs - The list of password input elements.
 */
function initPasswordValidation(passwordInputs) {
  passwordInputs[0].addEventListener("input", checkPasswords);
  passwordInputs[1].addEventListener("input", checkPasswords);
  passwordInputs[1].addEventListener("blur", () => {
    removeError(passwordInputs[1]);
    const passValue = passwordInputs[0].value;
    const confirmPassValue = passwordInputs[1].value;
    if (confirmPassValue !== "" && passValue !== confirmPassValue) {
      showError(passwordInputs[1], "Passwörter stimmen nicht überein.");
    }
  });
}

/**
 * Checks if the entered passwords match and triggers form validation.
 */
function checkPasswords() {
  removeError(passwordInputs[1]);
  const passValue = passwordInputs[0].value;
  const confirmPassValue = passwordInputs[1].value;
  if (confirmPassValue !== "" && passValue !== confirmPassValue) {
    showError(passwordInputs[1], "Passwörter stimmen nicht überein.");
  }
  checkFormValidity();
}

/**
 * Enables or disables the submit button based on form validity,
 * password match, and checkbox status.
 */
function checkFormValidity() {
  const formValid = form.checkValidity();
  const passValue = passwordInputs[0].value;
  const confirmPassValue = passwordInputs[1].value;
  const passwordsMatch = passValue === confirmPassValue;
  const isChecked = checkbox.checked;
  submitBtn.disabled = !(formValid && passwordsMatch && isChecked);
}

function signUp(event) {
  event.preventDefault();
  removeError(emailInput);
  removeError(passwordInputs[1]);
    const passValue = passwordInputs[0].value;
  const confirmPassValue = passwordInputs[1].value;
    if (passValue !== confirmPassValue) {
    showError(passwordInputs[1], "Passwörter stimmen nicht überein.");
    return;
  }
  const randomColor = getRandomColor();
  const newUser = createNewUser(nameInput.value, emailInput.value, passValue, randomColor);
  submitUserData(newUser);
}

/**
 * Returns a random color from a predefined color map.
 * @returns {string} The random color.
 */
function getRandomColor() {
  const colorMap = {
    "#F57C00": "profile-badge-F57C00",
    "#8E24AA": "profile-badge-8E24AA",
    "#5C6BC0": "profile-badge-5C6BC0",
    "#EC407A": "profile-badge-EC407A",
    "#FFEB3B": "profile-badge-FFEB3B",
    "#4CAF50": "profile-badge-4CAF50",
    "#3F51B5": "profile-badge-3F51B5",
    "#FF7043": "profile-badge-FF7043",
    "#29B6F6": "profile-badge-29B6F6"
  };
  const colorValues = Object.keys(colorMap);
  return colorValues[Math.floor(Math.random() * colorValues.length)];
}

/**
 * Creates a new user object.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} color - The assigned random color.
 * @returns {Object} The new user object.
 */
function createNewUser(name, email, password, color) {
  return {
    name: name.trim(),
    email: email.trim(),
    password: password,
    color: color
  };
}

/**
 * Sends the user data to Firebase and triggers the success animation.
 * @param {Object} newUser - The new user object.
 */
function submitUserData(newUser) {
  const dbUrl = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  fetch(dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  })
    .then(response => response.json())
    .then(() => {
      showSuccessAnimation();
    });
}



/**
 * Validates the given email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Displays an error message below the given input field.
 * @param {HTMLElement} inputElement - The input element to show the error for.
 * @param {string} message - The error message to display.
 */
function showError(inputElement, message) {
  inputElement.classList.add("input-error");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerText = message;
  inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
}

/**
 * Removes the error message associated with the given input field.
 * @param {HTMLElement} inputElement - The input element to clear errors from.
 */
function removeError(inputElement) {
  inputElement.classList.remove("input-error");
  const nextElem = inputElement.nextSibling;
  if (nextElem && nextElem.classList && nextElem.classList.contains("error-message")) {
    nextElem.remove();
  }
}

/**
 * Displays a sign-up success image animation, then redirects to the login page.
 */
function showSuccessAnimation() {
  const successImg = document.createElement("img");
  successImg.src = "../img/You Signed Up successfully.png";
  successImg.alt = "Sign Up Success";
  successImg.classList.add("success-animation");
  document.body.appendChild(successImg);

  successImg.addEventListener("animationend", () => {
    window.location.href = "./login.html";
  });
}
