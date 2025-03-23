/**
 * Toggles the active state of a priority button in the floating edit interface.
 * If the selected button is active, it deactivates it; otherwise, it activates it
 * and deactivates all other priority buttons.
 *
 * @param {string} priority - The priority type (e.g., 'urgentFloating', 'mediumFloating', 'lowFloating').
 */
function setPriorityFloatingEdit(priority) {
  const allButtons = document.querySelectorAll(
    '.priority-button-urgentFloating, .priority-button-mediumFloating, .priority-button-lowFloating'
  );
  const selectedButtons = document.querySelectorAll(`.priority-button-${priority}`);
  if (selectedButtons.length === 0) {
    return;
  }
  const selectedButton = selectedButtons[0];
  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    allButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
  }
}

/**
 * Deletes the current task from Firebase by sending a DELETE request.
 * If the deletion is successful, the floating modal is hidden and the page is reloaded.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteTaskFromFirebase() {
  if (!currentTaskId) {
    return;
  }
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${currentTaskId}.json`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Error deleting task: ${response.statusText}`);
    }
    document.getElementById("toggleModalFloating").style.display = "none";
    location.reload();
  } catch (error) {
    console.error(error);
  }
}
