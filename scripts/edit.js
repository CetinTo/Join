/**
 * Toggles the visibility of the floating modal with ID 'toggleModalFloating'.
 */
function toggleModalfloating() {
  const modal = document.getElementById('toggleModalFloating');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

/**
 * Toggles the visibility of the edit modal with ID 'taskModalEdit'.
 */
function toggleModalEdit() {
  const modal = document.getElementById('taskModalEdit');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

/**
 * Initializes modal functionality after DOM content is loaded.
 * Sets up event listeners for modal interactions.
 */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("taskModalEdit");
  const modalContent = document.querySelector(".main-section-floating-edit");

  /**
   * Toggles the display state of the edit modal.
   */
  function toggleModalEdit() {
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  }

  /**
   * Closes the edit modal by setting its display to 'none'.
   */
  function closeModalEdit() {
    modal.style.display = "none";
  }

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModalEdit();
    }
  });

  modalContent.addEventListener("click", event => {
    event.stopPropagation();
  });

  document.querySelectorAll(".close-modal-btn").forEach(button => {
    button.addEventListener("click", closeModalEdit);
  });

  document.querySelectorAll(".open-modal-btn").forEach(button => {
    button.addEventListener("click", toggleModalEdit);
  });
});
