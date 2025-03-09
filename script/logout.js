function logout() {
    localStorage.removeItem('currentUser'); // Nutzer aus localStorage entfernen
    window.location.href = './login-signup/login.html'; // Zur Login-Seite
  }
  