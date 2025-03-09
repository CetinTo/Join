document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('.btn.sign-up-btn');
    const checkbox = form.querySelector('input[type="checkbox"]');
    const nameInput = form.querySelector('.name');
    const emailInput = form.querySelector('.input-email');
    const passwordInputs = form.querySelectorAll('.icon-lock');
  
    // Startzustand: Button deaktiviert
    submitBtn.disabled = true;
  
    // Überwacht alle Eingaben im Formular
    form.addEventListener('input', checkFormValidity);
    checkbox.addEventListener('change', checkFormValidity);
  
    function checkFormValidity() {
      const formValid = form.checkValidity();
      const passValue = passwordInputs[0].value;
      const confirmPassValue = passwordInputs[1].value;
      const passwordsMatch = passValue === confirmPassValue;
      const isChecked = checkbox.checked;
  
      submitBtn.disabled = !(formValid && passwordsMatch && isChecked);
    }
  
    form.addEventListener('submit', signUp);
  
    function signUp(event) {
      event.preventDefault();
  
      const passValue = passwordInputs[0].value;
      const confirmPassValue = passwordInputs[1].value;
      if (passValue !== confirmPassValue) {
        alert("Die eingegebenen Passwörter stimmen nicht überein!");
        return;
      }
  
      const newUser = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passValue
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
        // Starte die Animation mit dem Success-Bild:
        showSuccessAnimation();
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        alert("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      });
    }
  
    function showSuccessAnimation() {
      // Erstelle das Bild-Element
      const successImg = document.createElement('img');
      successImg.src = '../img/You Signed Up successfully.png';
      successImg.alt = 'Sign Up Success';
      successImg.classList.add('success-animation');
  
      // Füge das Bild dem Body hinzu
      document.body.appendChild(successImg);
  
      // Nach Ende der Animation weiterleiten
      successImg.addEventListener('animationend', () => {
        window.location.href = "./login.html";
      });
    }
  });
  