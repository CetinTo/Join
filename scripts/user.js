document.addEventListener('DOMContentLoaded', () => {
  /**
   * Attaches click listener to guest login button if it exists.
   * Sets guest user data in localStorage and redirects to index.
   */
  const guestBtn = document.querySelector('.guest-btn');
  if (guestBtn) {
    guestBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.setItem('currentUser', JSON.stringify({
        name: 'Guest',
        isGuest: true
      }));
      window.location.href = '../index.html';
    });
  }
}); // Hier fehlt der Abschluss des DOMContentLoaded-Callbacks

/**
 * Loads the current user from localStorage and updates the UI.
 */
function updateUserUI() {
  const currentUserData = localStorage.getItem('currentUser');
  if (!currentUserData) return;

  const currentUser = JSON.parse(currentUserData);
  updateUsername(currentUser);
  updateUserInitials(currentUser);
}

/**
 * Updates the element with the class "username-span" with the user's name.
 * @param {Object} user - The user object.
 */
function updateUsername(user) {
  const nameSpan = document.querySelector('.username-span');
  if (nameSpan && user.name) {
    nameSpan.textContent = user.name;
  }
}

/**
 * Updates the account div with the user's initials.
 * @param {Object} user - The user object.
 */
function updateUserInitials(user) {
  if (!user.name) return;
  const initials = getInitials(user.name);
  const accountDiv = document.querySelector('.account > div');
  if (accountDiv) {
    accountDiv.textContent = initials;
  }
}

document.addEventListener("DOMContentLoaded", updateUserUI);

/**
 * Disables access to restricted links for guest users.
 * Currently not in use.
 */
function disableRestrictedLinks() {
  disableLinksByHref();
  disableBoardDivs();
}

function disableLinksByHref() {
  const restrictedHrefs = [
    './add-task/addtask.html',
    './board/board.html',
    './contact/contacts.html'
  ];
  restrictedHrefs.forEach(href => {
    const links = document.querySelectorAll(`a[href="${href}"]`);
    links.forEach(link => {
      link.removeAttribute('href');
      link.style.opacity = '0.5';
      link.style.cursor = 'not-allowed';
      link.addEventListener('click', e => e.preventDefault());
    });
  });
}

/**
 * Disables all elements that trigger the "goToBoard()" function via onclick.
 */
function disableBoardDivs() {
  const boardDivs = document.querySelectorAll('[onclick="goToBoard()"]');
  boardDivs.forEach(div => {
    div.removeAttribute('onclick');
    div.style.opacity = '0.7';
    div.style.cursor = 'not-allowed';
    div.addEventListener('click', e => e.preventDefault());
  });
}

/**
 * Returns the initials of a given full name.
 * @param {string} name - The full name of the user.
 * @returns {string} The initials in uppercase.
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
