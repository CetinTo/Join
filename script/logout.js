/**
 * Logs out the current user by removing user data from localStorage
 * and redirecting to the login page.
 */
function logout() {
  localStorage.removeItem('currentUser'); 
  window.location.href = './login-signup/login.html'; 
}

/**
 * Alternative Funktion für die Umleitung, die in manchen Teilen der Anwendung verwendet wird
 */
function logoutToLogin() {
  localStorage.removeItem('currentUser'); 
  window.location.href = '../login-signup/login.html'; 
} 