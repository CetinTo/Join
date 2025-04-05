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
  const modalBackground = document.querySelector(".modal-background-task-overlay");
  if (!modalBackground) return;
  
  attachModalBackgroundClick(modalBackground);
});

/**
 * Attaches a click event listener to the modal background which hides the modal if clicked outside.
 * @param {HTMLElement} modalBackground - The modal background element.
 */
function attachModalBackgroundClick(modalBackground) {
  modalBackground.addEventListener("click", (event) => {
    if (event.target === modalBackground) {
      modalBackground.style.display = "none";
    }
  });
}

  