/**
 * Initializes UI elements and interactions after DOM content is loaded.
 * - Loads current user data from localStorage and displays user name/initials.
 * - Handles dropdown menu toggle for the account section.
 * - Manages mobile and desktop behavior of the "Add Task" button.
 * - Handles modal visibility on window resize.
 */
document.addEventListener('DOMContentLoaded', () => {
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

  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (accountButton && dropdownMenu) {
    /**
     * Toggles the visibility of the account dropdown menu when the account button is clicked.
     */
    accountButton.addEventListener('click', function (event) {
      event.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    /**
     * Closes the dropdown menu when clicking outside of it.
     */
    document.addEventListener('click', function (event) {
      if (!dropdownMenu.contains(event.target) && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  const addTaskButtons = document.querySelectorAll('.add-task-button');

  /**
   * Handles click events for all "Add Task" buttons.
   * Opens a modal on desktop or navigates to add-task page on mobile.
   */
  addTaskButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      if (window.innerWidth <= 440) {
        const currentPath = window.location.pathname;
        let path;

        if (currentPath.includes('/board/') || currentPath.includes('/contact/')) {
          path = '../add-task/addtask.html';
        } else {
          path = './add-task/addtask.html';
        }

        window.location.href = path;
      } else {
        const modal = document.querySelector('.add-task-modal');
        if (modal) {
          modal.style.display = 'flex';
        }
      }
    });
  });

  /**
   * Closes the modal when the window is resized to a width greater than 440px.
   */
  window.addEventListener('resize', () => {
    const modal = document.querySelector('.add-task-modal');
    if (window.innerWidth > 440 && modal) {
      modal.style.display = 'none';
    }
  });
});

/**
 * Generates initials from a user's full name.
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
