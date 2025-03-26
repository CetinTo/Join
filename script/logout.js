/**
 * Logs out the current user by removing user data from localStorage
 * and redirecting to the login page.
 */
function logout() {
  localStorage.removeItem('currentUser'); 
  window.location.href = 'http://join-419.developerakademie.net/join/login-signup/login.html';

}

/**
 * Alternative Funktion für die Umleitung, die in manchen Teilen der Anwendung verwendet wird
 */
function logoutToLogin() {
  localStorage.removeItem('currentUser'); 
<<<<<<< HEAD
  window.location.href = '../login-signup/login.html'; 
} 
=======
  window.location.href = 'http://join-419.developerakademie.net/join/login-signup/login.html';

}
>>>>>>> c13b19985c13c537e5fe4b138a9209aeaa5b3cc1
