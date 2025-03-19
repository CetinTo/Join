document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', handleLogin);
  
    function handleLogin(event) {
      event.preventDefault();
  
      // E-Mail und Passwort auslesen
      const emailValue = document.getElementById('email').value.trim();
      const passwordValue = document.getElementById('password').value;
      const errorElement = document.getElementById('error-message');
  
      // Zurücksetzen der vorherigen Fehlermeldung
      errorElement.textContent = '';
  
      // 1) Alle User-Datensätze aus der Realtime DB abrufen
      fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/users.json')
        .then(response => response.json())
        .then(data => {
          /*
            data ist ein Objekt mit vielen Einträgen (z.B.):
            {
              "-ND2...": {
                "email": "...",
                "name": "...",
                "password": "..."
              },
              ...
            }
          */
  
          // 2) Passenden Nutzer mit gleicher E-Mail + Passwort suchen
          let foundUser = null;
          for (let key in data) {
            const user = data[key];
            // Überprüfen, ob E-Mail & Passwort matchen
            if (user.email === emailValue && user.password === passwordValue) {
              foundUser = user;
              break;
            }
          }
  
          // 3) Wenn User gefunden, dann einloggen
          if (foundUser) {
            // Optional: Nutzer in localStorage ablegen, um Login-Zustand zu merken
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            
            // 4) Weiterleitung zu index.html
            window.location.href = '../index.html';
          } else {
            // Falls kein User gefunden, Meldung ausgeben
            errorElement.textContent = 'Email or password is incorrect';
          }
        })
        .catch(error => {
          console.error('Fehler beim Abruf der Nutzer:', error);
          errorElement.textContent = 'An error occurred during login. Please try again.';
        });
    }
  });
  
/**
 * Führt den Login-Vorgang durch
 */
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('error-message');
  
  // Zurücksetzen der vorherigen Fehlermeldung
  errorElement.textContent = '';
  
  try {
    // Überprüfen, ob der Benutzer in der Datenbank existiert
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/users.json');
    const userData = await response.json();
    
    let userFound = false;
    let userName = '';
    
    // Durchsuchen der Benutzerdaten
    for (const key in userData) {
      if (userData[key].email === email && userData[key].password === password) {
        userFound = true;
        userName = userData[key].name || 'User';
        break;
      }
    }
    
    if (userFound) {
      // Erfolgreicher Login: Benutzerdaten im localStorage speichern
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', userName);
      
      // Weiterleitung zur Hauptseite
      window.location.href = '../index.html';
    } else {
      // Fehlerfall: Anzeigen der Fehlermeldung
      errorElement.textContent = 'Email or password is incorrect';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorElement.textContent = 'An error occurred during login. Please try again.';
  }
}
  