/**
 * Logs out the current user by removing user data from localStorage
 * and redirecting to the login page.
 */
function logout() {
  localStorage.removeItem('currentUser'); 
  window.location.href = './login-signup/login.html'; 
}


function logoutToLogin() {
  localStorage.removeItem('currentUser'); 
  window.location.href = './login-signup/login.html'; 
}
