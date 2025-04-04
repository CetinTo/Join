/**
 * Initializes the logout and dropdown functionality for the account button.
 * Replaces event listeners, sets up toggling, and logout behavior.
 */
function initializeLogout() {
  const accountBtn = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (!accountBtn || !dropdownMenu) {
    console.error('Account button or dropdown menu not found');
    return;
  }

  const newAccountBtn = replaceElementWithClone(accountBtn);
  setupDropdownToggle(newAccountBtn, dropdownMenu);
  setupDropdownLinks(dropdownMenu);
  setupOutsideClickListener(newAccountBtn, dropdownMenu);
  newAccountBtn.classList.add('initialized');
}

/**
 * Replaces a DOM element with its clone to remove all existing event listeners.
 * @param {HTMLElement} element - The element to be cloned and replaced.
 * @returns {HTMLElement} The new cloned element without any attached listeners.
 */
function replaceElementWithClone(element) {
  const clone = element.cloneNode(true);
  element.parentNode.replaceChild(clone, element);
  return clone;
}

/**
 * Adds a click event listener to toggle the visibility of the dropdown menu.
 * @param {HTMLElement} button - The account button.
 * @param {HTMLElement} menu - The dropdown menu.
 */
function setupDropdownToggle(button, menu) {
  button.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    menu.classList.toggle('show');
    menu.classList.toggle('show-dropdown');
  });
}

/**
 * Adds click event listeners to links inside the dropdown menu.
 * Specifically handles logout when the link points to the login page.
 * @param {HTMLElement} menu - The dropdown menu containing links.
 */
function setupDropdownLinks(menu) {
  const links = menu.querySelectorAll('a');
  links.forEach(link => {
    const newLink = replaceElementWithClone(link);
    newLink.addEventListener('click', function(event) {
      event.stopPropagation();
      if (newLink.href.includes('http://join-419.developerakademie.net/join/login-signup/login.html')) {
        handleLogout(event, newLink.href);
      }
    });
  });
}

/**
 * Handles the logout process by clearing relevant localStorage keys
 * and redirecting to the provided login URL.
 * @param {MouseEvent} event - The click event triggering logout.
 * @param {string} redirectUrl - The URL to redirect to after logout.
 */
function handleLogout(event, redirectUrl) {
  event.preventDefault();
  console.log('Performing logout...');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('currentUser');
  window.location.href = '/join/login-signup/login.html';
}

/**
 * Adds an event listener to close the dropdown menu
 * when clicking outside of the menu or account button.
 * @param {HTMLElement} button - The account button.
 * @param {HTMLElement} menu - The dropdown menu.
 */
function setupOutsideClickListener(button, menu) {
  document.addEventListener('click', function(event) {
    if (!button.contains(event.target) && !menu.contains(event.target)) {
      menu.classList.remove('show');
      menu.classList.remove('show-dropdown');
    }
  });
}

/**
 * Einfache Logout-Funktion, die für alle Seiten verwendet werden kann
 */
function logout() {
  // Benutzer-Daten aus dem LocalStorage löschen
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  
  // Zu einem absoluten Pfad umleiten (statt eines relativen Pfads)
  window.location.href = '/join/login-signup/login.html';
}

/**
 * Alternative Logout-Funktion für die onclick-Ereignisse
 */
function logoutToLogin() {
  logout(); // Verwende die Hauptfunktion
}

// Run initializer after DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLogout);
} else {
  initializeLogout();
}
