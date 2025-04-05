/**
 * Creates a <span> element for the subtask text.
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The <span> element.
 */
function createSubtaskTextSpan(text) {
    const span = document.createElement('span');
    span.innerText = `• ${text}`;
    return span;
}
  
/**
 * Creates the container for action icons (edit and delete).
 * @returns {HTMLElement} The actions container element.
 */
function createSubtaskActions() {
  const actionsDiv = createActionsContainer();
  const editIcon = createActionIcon("../img/pen.png", "Edit", "subtask-edit-edit");
  const deleteIcon = createActionIcon("../img/trash.png", "Delete", "subtask-delete-edit");
  actionsDiv.appendChild(editIcon);
  actionsDiv.appendChild(deleteIcon);
  return actionsDiv;
}

/**
 * Creates the container element for the action icons.
 * @returns {HTMLElement} The container element.
 */
function createActionsContainer() {
  const div = document.createElement('div');
  div.className = "subtask-actions";
  return div;
}

/**
 * Creates an action icon element.
 * @param {string} src - The source URL for the icon image.
 * @param {string} alt - The alternate text for the icon.
 * @param {string} className - The class name(s) for styling the icon.
 * @returns {HTMLElement} The created image element.
 */
function createActionIcon(src, alt, className) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.className = className;
  return img;
}


/**
 * Removes the leading "• " from the text.
 * @param {HTMLElement} span - The span element containing the text.
 * @returns {string} The cleaned text.
 */
function getCleanText(span) {
    return span.innerText.replace('• ', '');
}
  
/**
 * Creates an input field and replaces the specified span element.
 * @param {HTMLElement} container - The parent container.
 * @param {HTMLElement} span - The span element to be replaced.
 * @param {string} text - The text to set in the input.
 * @returns {HTMLElement} The input field element.
 */
function createAndReplaceInput(container, span, text) {
    const input = createEditInput(text);
    container.replaceChild(input, span);
    input.focus();
    return input;
}
  
/**
 * Registers the blur listener which updates and saves the new text.
 * @param {HTMLElement} input - The input field element.
 * @param {HTMLElement} container - The parent container.
 * @param {string} originalText - The original text.
 */
function registerBlurHandler(input, container, originalText) {
    input.addEventListener('blur', async () => {
      const newText = input.value.trim();
      const finalText = newText !== '' ? newText : originalText;
      const newSpan = createSubtaskTextSpan(finalText);
      container.replaceChild(newSpan, input);
      const index = container.dataset.index;
      if (window.currentTask && window.currentTask.subtasks && index !== undefined) {
        window.currentTask.subtasks[index].text = finalText;
        // Save the updated task (including subtasks) immediately
        await updateTaskInFirebase(window.currentTask);
      }
  });
}
  
/**
 * Replaces the text element with an input field for editing.
 * @param {HTMLElement} container - The parent container of the subtask.
 * @param {HTMLElement} span - The current text element.
 * @param {string} originalText - The original text.
 */
function replaceSpanWithInput(container, span, originalText) {
    const currentText = getCleanText(span);
    const input = createAndReplaceInput(container, span, currentText);
    registerBlurHandler(input, container, originalText);
}
  
/**
 * Creates an input field for editing the subtask text.
 * @param {string} text - The text to be edited.
 * @returns {HTMLElement} The input field element.
 */
function createEditInput(text) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.classList.add('responsive-subtask-input');
    return input;
}
  
/**
 * Returns the currently selected priority.
 * @returns {string} The selected priority.
 */
function getSelectedPriority() {
    if (document.querySelector('.edit-priority-urgent.active')) return 'urgent';
    if (document.querySelector('.edit-priority-medium.active')) return 'medium';
    if (document.querySelector('.edit-priority-low.active')) return 'low';
    return 'medium';
}
  
/**
 * Returns the priority image path based on the given priority.
 * @param {string} priority - The priority level.
 * @returns {string} The image path for the priority.
 */
function getPriorityPath(priority) {
    switch (priority) {
      case 'urgent': return '../img/priority-img/urgent.png';
      case 'medium': return '../img/priority-img/medium.png';
      case 'low':    return '../img/priority-img/low.png';
      default:       return '../img/priority-img/medium.png';
    }
}
  
/**
 * Saves the edited task to Firebase.
 */
async function saveEditedTaskToFirebase() {
    if (!currentTask) return;
    updateTaskFromInputs();
    await updateTaskInFirebase(currentTask);
    closeEditModal();
    // Removed location.reload() to show changes immediately.
}
  
/**
 * Updates the current task object with values from the edit modal inputs.
 */
function updateTaskFromInputs() {
    currentTask.title = document.getElementById('editTaskTitle').value.trim() || currentTask.title;
    currentTask.description = document.getElementById('editTaskDescription').value.trim() || currentTask.description;
    currentTask.dueDate = document.getElementById('editDueDate').value.trim() || currentTask.dueDate;
    const prio = getSelectedPriority();
    currentTask.priority = getPriorityPath(prio);
    const cat = document.getElementById('editTaskCategory').value;
    currentTask.category = (cat === 'technical') ? 'Technical task' : 'User Story';
    const newSubs = readSubtasksFromEditModal();
    if (newSubs.length) currentTask.subtasks = newSubs;
    const newAssignees = readAssigneesFromBadges();
    if (newAssignees.length) {
      currentTask.users = newAssignees;
    }
}
  
/**
 * Updates the task in Firebase.
 * @param {Object} task - The task object.
 */
async function updateTaskInFirebase(task) {
    if (!task || !task.firebaseKey) return;
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${task.firebaseKey}.json`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error(`Update failed: ${response.statusText}`);
    } catch (error) {}
}
  
/**
 * Closes the edit modal.
 * @param {Event} [event] - The event object.
 */
function closeEditModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('editTaskModal');
    if (modal) modal.style.display = 'none';
}
  
/**
 * Binds the confirm button to the save process.
 */
function bindConfirmEditButton() {
    document.getElementById('confirmEditBtn')?.addEventListener('click', saveEditedTaskToFirebase);
}
  
/**
 * Initializes the addition of a new subtask in the edit modal.
 */
function initSubtaskAddition() {
    const subtaskInput = document.querySelector('.subtask-input');
    const subtaskCheck = document.querySelector('.subtask-edit-check');
    const subtasksList = document.getElementById('editSubtasksList');
    subtaskCheck?.addEventListener('click', () => {
      const text = subtaskInput.value.trim();
      if (text !== '') {
        const newSubtask = createNewSubtaskElement(text);
        subtasksList.appendChild(newSubtask);
        subtaskInput.value = '';
      }
    });
}
  
/**
 * Creates a new subtask element based on the entered text.
 * @param {string} text - The text for the new subtask.
 * @returns {HTMLElement} The new subtask element.
 */
function createNewSubtaskElement(text) {
    const newSubtask = document.createElement('div');
    newSubtask.className = 'subtask-item';
    newSubtask.innerHTML = `
      <span>• ${text}</span>
      <div class="subtask-actions">
        <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
        <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
      </div>`;
    newSubtask.dataset.index = window.currentTask.subtasks ? window.currentTask.subtasks.length : 0;
    return newSubtask;
}
  
/**
 * Initializes the listener to remove subtasks on delete button click.
 */
function initSubtaskDeletion() {
    const subtasksList = document.getElementById('editSubtasksList');
    subtasksList?.addEventListener('click', e => {
      if (e.target?.matches('img[alt="Delete"]')) {
        e.target.closest('.subtask-item')?.remove();
      }
    });
}
  
document.addEventListener('DOMContentLoaded', () => {
    bindConfirmEditButton();
    initSubtaskAddition();
    initSubtaskDeletion();
});