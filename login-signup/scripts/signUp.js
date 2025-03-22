document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const submitBtn = form.querySelector('.btn.sign-up-btn');
  const checkbox = form.querySelector('input[type="checkbox"]');
  const nameInput = form.querySelector('.name');
  const emailInput = form.querySelector('.input-email');
  const passwordInputs = form.querySelectorAll('.icon-lock');

  submitBtn.disabled = true;

  form.addEventListener('input', checkFormValidity);
  checkbox.addEventListener('change', checkFormValidity);

  emailInput.addEventListener('blur', () => {
    removeError(emailInput);
    const emailValue = emailInput.value.trim();
    if (emailValue !== '' && !validateEmail(emailValue)) {
      showError(emailInput, 'Bitte eine gültige E-Mail-Adresse eingeben.');
    }
  });

  passwordInputs[0].addEventListener('input', checkPasswords);
  passwordInputs[1].addEventListener('input', checkPasswords);

  passwordInputs[1].addEventListener('blur', () => {
    removeError(passwordInputs[1]);
    const passValue = passwordInputs[0].value;
    const confirmPassValue = passwordInputs[1].value;
    if (confirmPassValue !== '' && passValue !== confirmPassValue) {
      showError(passwordInputs[1], 'Passwörter stimmen nicht überein.');
    }
  });

  form.addEventListener('submit', signUp);

  function checkPasswords() {
    removeError(passwordInputs[1]);
    const passValue = passwordInputs[0].value;
    const confirmPassValue = passwordInputs[1].value;
    if (confirmPassValue !== '' && passValue !== confirmPassValue) {
      showError(passwordInputs[1], 'Passwörter stimmen nicht überein.');
    }
    checkFormValidity();
  }

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
      showError(passwordInputs[1], 'Passwörter stimmen nicht überein.');
      return;
    }
  
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
    const randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
    
    const newUser = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passValue,
      color: randomColor // <--- Nur der HEX-Wert wird gespeichert
    };
  
    const dbUrl = 'https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';
    fetch(dbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Neuer Datensatz angelegt:', data);
        showSuccessAnimation();
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        alert("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
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

  function showSuccessAnimation() {
    const successImg = document.createElement('img');
    successImg.src = '../img/You Signed Up successfully.png';
    successImg.alt = 'Sign Up Success';
    successImg.classList.add('success-animation');
    document.body.appendChild(successImg);
    successImg.addEventListener('animationend', () => {
      window.location.href = "./login.html";
    });
  }
});
