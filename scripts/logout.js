/**
 * Logs out the current user by removing user data from localStorage
 * and redirecting to the login page.
 */
function logout() {
  localStorage.removeItem('currentUser'); 
  localStorage.removeItem('userLoggedIn'); // Login-Status entfernen
  window.location.href = './html/login.html'; // Lokale Login-Seite verwenden

}


function logoutToLogin() {
  localStorage.removeItem('currentUser'); 
  localStorage.removeItem('userLoggedIn'); // Login-Status entfernen
  window.location.href = './html/login.html'; // Lokale Login-Seite verwenden

}
