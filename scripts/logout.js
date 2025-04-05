/**
 * Logs out the current user by removing user data from localStorage
 * and redirecting to the login page.
 */
function logout() {
  localStorage.removeItem('currentUser'); 
  window.location.href = 'http://join-419.developerakademie.net/join/html/login.html';

}


function logoutToLogin() {
  localStorage.removeItem('currentUser'); 
  window.location.href = 'http://join-419.developerakademie.net/join/html/login.html';

}
