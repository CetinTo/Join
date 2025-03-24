/**
 * Initializes the logout and dropdown functionality for the account button.
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
 * @returns {HTMLElement} - The new cloned element.
 */
function replaceElementWithClone(element) {
  const clone = element.cloneNode(true);
  element.parentNode.replaceChild(clone, element);
  return clone;
}

/**
 * Adds a click event listener to toggle the dropdown menu.
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
 * Adds click event listeners to each link inside the dropdown menu.
 * Handles logout when the link points to 'login.html'.
 * @param {HTMLElement} menu - The dropdown menu.
 */
function setupDropdownLinks(menu) {
  const links = menu.querySelectorAll('a');
  links.forEach(link => {
    const newLink = replaceElementWithClone(link);
    newLink.addEventListener('click', function(event) {
      event.stopPropagation();
      if (newLink.href.includes('../login-signup/login.html')) {
        handleLogout(event, newLink.href);
      }
    });
  });
}

/**
 * Handles the logout process by clearing localStorage and redirecting.
 * @param {MouseEvent} event - The click event.
 * @param {string} redirectUrl - The URL to redirect to after logout.
 */
function handleLogout(event, redirectUrl) {
  event.preventDefault();
  console.log('Performing logout...');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = redirectUrl;
}

/**
 * Closes the dropdown menu when clicking outside of it or the button.
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

// Run initializer after DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLogout);
} else {
  initializeLogout();
}
