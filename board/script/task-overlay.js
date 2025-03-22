/******************************************************
 * Initializes the modal background overlay to close
 * the modal if the user clicks outside the modal area.
 ******************************************************/

/**
 * Sets up a click listener on the modal background to hide it when clicked.
 *
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
    /**
     * The overlay element that serves as the modal background.
     * @type {HTMLElement|null}
     */
    const modalBackground = document.querySelector(".modal-background-task-overlay");
  
    if (!modalBackground) return;
  
    /**
     * Hides the modal background if the user clicks directly on it (outside the modal).
     *
     * @param {MouseEvent} event - The click event on the modal background.
     */
    modalBackground.addEventListener("click", (event) => {
      if (event.target === modalBackground) {
        modalBackground.style.display = "none";
      }
    });
  });
  