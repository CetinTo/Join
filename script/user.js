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

    // 3. If user is guest, disable restricted links
    if (currentUser.isGuest) {
      disableRestrictedLinks();
    }
  }

  // ... rest of your existing code ...
});

/**
 * Disables links that a guest user should not click
 */
function disableRestrictedLinks() {
  // List the links to disable for guests
  const restrictedHrefs = [
    './add-task/addtask.html',
    './board/board.html',
    './contact/contacts.html'
  ];

  restrictedHrefs.forEach((href) => {
    const link = document.querySelector(`a[href="${href}"]`);
    if (link) {
      // Remove the actual link so it can’t navigate
      link.removeAttribute('href');

      // Intercept clicks (or just do nothing if no href)
      link.addEventListener('click', (e) => {
        e.preventDefault(); // no navigation
      });

      // Visually dim the link
      link.style.opacity = '0.5';

      // Show the “not-allowed” cursor
      link.style.cursor = 'not-allowed';
    }
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
