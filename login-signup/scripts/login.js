document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', handleLogin);
  
    function handleLogin(event) {
      event.preventDefault();
  
      // E-Mail und Passwort auslesen
      const emailValue = document.getElementById('email').value.trim();
      const passwordValue = document.getElementById('password').value;
  
      // 1) Alle User-Datensätze aus der Realtime DB abrufen
      fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json')
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
            alert('E-Mail oder Passwort ist falsch. Bitte versuche es erneut.');
          }
        })
        .catch(error => {
          console.error('Fehler beim Abruf der Nutzer:', error);
          alert('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
        });
    }
  });
  