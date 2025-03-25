/**
 * Adds a click listener to a button to open a specific modal.
 * @param {string} addButtonId - The ID of the button that opens the modal.
 * @param {string} modalId - The ID of the modal to be opened.
 */
function setupModalButton(addButtonId, modalId) {
  const addButton = document.getElementById(addButtonId);
  const modal = document.getElementById(modalId);
  if (!addButton || !modal) return;

  addButton.addEventListener('click', () => {
    modal.style.display = 'block';
  });
}

/**
 * Adds a global event listener to close the modal
 * when clicking outside of it.
 * @param {string} modalId - The ID of the modal to be closed.
 */
function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Toggles the display state of the modal with ID 'taskModal'.
 * Registered globally as window.toggleModal.
 */
function toggleModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
  }
}

/**
 * Initializes the account dropdown behavior.
 * Shows/hides dropdown on button click and closes it when clicking outside.
 */
function setupAccountDropdown() {
  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (!accountButton || !dropdownMenu) return;

  accountButton.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  });
}

/**
 * Initializes modal buttons, modal close logic, account dropdown,
 * and registers global modal toggle after DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  setupModalButton('addTaskButtonTodo', 'taskModal');
  setupModalButton('addTaskButtonInProgress', 'taskModal');
  setupModalButton('addTaskButtonAwaitFeedback', 'taskModal');
  setupModalButton('addTaskButton', 'taskModal');

  setupModalClose('taskModal');
  setupAccountDropdown();

  window.toggleModal = toggleModal;
});
