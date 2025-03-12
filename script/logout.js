function logout() {
  localStorage.removeItem('currentUser'); 
  window.location.href = './login-signup/login.html'; 
}
