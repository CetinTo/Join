/**
 * Vereinfachte Login-Funktion
 */
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.onsubmit = async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      
      // Fehlermeldung zurücksetzen
      errorMessage.textContent = '';

      try {
          // Benutzerdaten von Firebase abrufen
          const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/users.json');
          const users = await response.json();

          // Benutzer suchen
          let foundUser = null;
          for (let key in users) {
              const user = users[key];
              if (user.email === email && user.password === password) {
                  foundUser = user;
                  break;
              }
          }

          if (foundUser) {
              // Erfolgreicher Login
              localStorage.setItem('currentUser', JSON.stringify(foundUser));
              window.location.href = '../index.html';
          } else {
              // Fehlgeschlagener Login
              errorMessage.textContent = 'Email or password is incorrect';
          }

      } catch (error) {
          console.error('Login error:', error);
          errorMessage.textContent = 'An error occurred. Please try again.';
      }
  };
});