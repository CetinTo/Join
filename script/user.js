document.addEventListener('DOMContentLoaded', () => {
  // 1. If there's a "Guest Log in" button, attach a listener
  const guestBtn = document.querySelector('.guest-btn');
  if (guestBtn) {
    guestBtn.addEventListener('click', (event) => {
      event.preventDefault();

      // Mark user as guest in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        name: 'Guest',
        isGuest: true
      }));

      // Go to index.html
      window.location.href = '../index.html'; 
      // or './index.html' depending on your folder structure
    });
  }

  // 2. Load current user from localStorage
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    const currentUser = JSON.parse(currentUserData);

    // --- Existing code to show name, initials, etc. ---
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

    // 👇 Einschränkungen für Gäste entfernt
    // if (currentUser.isGuest) {
    //   disableRestrictedLinks();
    // }
  }

  // ... rest of your existing code ...
});


/**
 * Disables links that a guest user should not click
 * (Aktuell nicht verwendet, da Gäste Zugriff haben sollen)
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
 * Generates initials from a user's full name.
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
