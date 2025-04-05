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

/**
 * Loads current user from localStorage and updates UI accordingly.
 */
const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    const currentUser = JSON.parse(currentUserData);
    const nameSpan = document.querySelector('.username-span');
    if (nameSpan) {
      nameSpan.textContent = currentUser.name;
    }
    if (currentUser.name) {
      const initials = getInitials(currentUser.name);
      const accountDiv = document.querySelector('.account > div');
      if (accountDiv) {
        accountDiv.textContent = initials;
      }
    }
  }
});


/**
 * Disables access to restricted links for guest users.
 * Currently not in use.
 */
function disableRestrictedLinks() {
  const restrictedHrefs = [
    './add-task/addtask.html',
    './board/board.html',
    './contact/contacts.html'
  ];

  restrictedHrefs.forEach((href) => {
    const links = document.querySelectorAll(`a[href="${href}"]`);
    links.forEach(link => {
      link.removeAttribute('href');
      link.style.opacity = '0.5';
      link.style.cursor = 'not-allowed';
      link.addEventListener('click', (e) => e.preventDefault());
    });
});

const boardDivs = document.querySelectorAll('[onclick="goToBoard()"]');
  boardDivs.forEach((div) => {
    div.removeAttribute('onclick');
    div.style.opacity = '0.7';
    div.style.cursor = 'not-allowed';
    div.addEventListener('click', (e) => e.preventDefault());
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
