document.addEventListener('DOMContentLoaded', function () {
  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const logoutLink = dropdownMenu?.querySelector('a[href*="https://join-419.developerakademie.net/join/html/login.html"]');
  if (!accountButton || !dropdownMenu) {
    console.error('Account-Button oder Dropdown-Menü nicht gefunden!');
    return;
}

/**
 * Toggles the visibility of the dropdown menu
 * when the account button is clicked.
 * @param {MouseEvent} event
 */
accountButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

/**
 * Closes the dropdown menu when clicking outside of it.
 */
document.addEventListener('click', function () {
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
});

/**
 * Prevents click events inside the dropdown menu
 * from propagating to the document.
 * @param {MouseEvent} event
 */
dropdownMenu.addEventListener('click', function (event) {
    event.stopPropagation();
});

/**
 * Handles logout logic if a logout link exists.
 * @param {MouseEvent} event
 */
if (logoutLink) {
    logoutLink.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      window.location.href = 'https://join-419.developerakademie.net/join/html/login.html';
    });
  }
});
