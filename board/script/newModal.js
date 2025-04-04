/**
 * Fills the edit modal with task details.
 * @param {Object} task - The task object.
 */
function fillEditModal(task) {
  setTaskFields(task);
  setAssigneeBadges(task);
  setSubtasksList(task);
  loadContacts(task.users || []);
}

/**
 * Sets the task fields in the edit modal.
 * @param {Object} task - The task object.
 */
function setTaskFields(task) {
  document.getElementById('editTaskTitle').value = task.title || "";
  document.getElementById('editTaskDescription').value = task.description || "";
  document.getElementById('editDueDate').value = task.dueDate || "";
  const prio = extractPriority(task.priority);
  setEditPriority(prio);
  if (task.category === 'Technical task') {
    document.getElementById('editTaskCategory').value = 'technical';
  } else if (task.category === 'User Story') {
    document.getElementById('editTaskCategory').value = 'userstory';
  } else {
    document.getElementById('editTaskCategory').value = '';
  }
}

/**
 * Sets the assignee badges in the edit modal.
 * @param {Object} task - The task object.
 */
function setAssigneeBadges(task) {
  const badges = document.getElementById('assigneeBadges');
  if (badges && task.users && task.users.length > 0) {
    badges.innerHTML = task.users.map(user => {
      let colorValue = user.color || "default";
      if (colorValue.startsWith('#')) {
        switch (colorValue.toUpperCase()) {
          case '#F57C00': colorValue = 'orange'; break;
          case '#E74C3C': colorValue = 'red'; break;
          case '#5C6BC0': colorValue = 'blue'; break;
          case '#4CAF50': colorValue = 'green'; break;
          case '#8E44AD': colorValue = 'purple'; break;
          case '#EE00FF': colorValue = 'pink'; break;
          default: colorValue = "default"; break;
        }
      }
      const badgeClass = getBadgeClassFromAnyColor(colorValue);
      const initials = user.initials || getInitials(user.name);
      return `
        <div class="assignee-badge ${badgeClass}"
             data-contact-color="${colorValue}"
             data-contact-name="${user.name}">
          ${initials}
        </div>`;
    }).join("");
  } else {
    badges.innerHTML = "";
  }
}

/**
 * Populates the edit subtasks list.
 * @param {Object} task - The task object containing subtasks.
 */
function setSubtasksList(task) {
  const list = document.getElementById('editSubtasksList');
  list.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length) {
    task.subtasks.forEach(subtask => {
      const subtaskItem = createSubtaskItem(subtask);
      list.appendChild(subtaskItem);
    });
  }
}

/**
 * Creates the entire subtask element including text and action buttons.
 * @param {Object} subtask - The subtask data.
 * @returns {HTMLElement} - The subtask element.
 */
function createSubtaskItem(subtask) {
  const stDiv = document.createElement("div");
  stDiv.className = "subtask-item";
  
  // Checkbox for completed status
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "subtask-edit-checkbox";
  checkbox.checked = subtask.completed;
  
  const span = createSubtaskTextSpan(subtask.text);
  const actionsDiv = createSubtaskActions();
  
  stDiv.appendChild(checkbox);
  stDiv.appendChild(span);
  stDiv.appendChild(actionsDiv);
  
  // Edit-Icon event to edit text
  const editIcon = actionsDiv.querySelector('.subtask-edit-edit');
  editIcon.addEventListener('click', () => {
    replaceSpanWithInput(stDiv, span, subtask.text);
  });
  
  return stDiv;
}

/**
 * Creates a <span> element for the subtask text.
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} - The <span> element.
 */
function createSubtaskTextSpan(text) {
  const span = document.createElement('span');
  span.innerText = `• ${text}`;
  return span;
}

/**
 * Creates the container for action icons (edit and delete).
 * @returns {HTMLElement} - The actions container element.
 */
function createSubtaskActions() {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = "subtask-actions";
  const editIcon = document.createElement('img');
  editIcon.src = "../img/pen.png";
  editIcon.alt = "Edit";
  editIcon.className = "subtask-edit-edit";
  const deleteIcon = document.createElement('img');
  deleteIcon.src = "../img/trash.png";
  deleteIcon.alt = "Delete";
  deleteIcon.className = "subtask-delete-edit";
  actionsDiv.appendChild(editIcon);
  actionsDiv.appendChild(deleteIcon);
  return actionsDiv;
}

/**
 * Replaces the text element with an input field to enable editing.
 * @param {HTMLElement} container - The parent element of the subtask.
 * @param {HTMLElement} span - The current text element.
 * @param {string} originalText - The original text.
 */
function replaceSpanWithInput(container, span, originalText) {
  const currentText = span.innerText.replace('• ', '');
  const input = createEditInput(currentText);
  container.replaceChild(input, span);
  input.focus();
  input.addEventListener('blur', () => {
    const newText = input.value.trim();
    const finalText = newText !== '' ? newText : originalText;
    const newSpan = createSubtaskTextSpan(finalText);
    container.replaceChild(newSpan, input);
  });
}

/**
 * Creates an input field for editing the subtask text.
 * @param {string} text - The text to be edited.
 * @returns {HTMLElement} - The input field element.
 */
function createEditInput(text) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.classList.add('responsive-subtask-input');
  return input;
}

/**
 * Extracts the priority level from a given path.
 * @param {string} priorityPath - The priority image path.
 * @returns {string} - The priority level ('urgent', 'low', or 'medium').
 */
function extractPriority(priorityPath) {
  if (!priorityPath) return 'medium';
  const lowerPath = priorityPath.toLowerCase();
  if (lowerPath.includes('urgent')) return 'urgent';
  if (lowerPath.includes('low')) return 'low';
  return 'medium';
}

/**
 * Sets the active priority button based on the given priority.
 * @param {string} priority - The priority level.
 */
function setEditPriority(priority) {
  const urgentBtn = document.querySelector('.edit-priority-urgent');
  const mediumBtn = document.querySelector('.edit-priority-medium');
  const lowBtn = document.querySelector('.edit-priority-low');
  urgentBtn.classList.remove('active');
  mediumBtn.classList.remove('active');
  lowBtn.classList.remove('active');
  switch (priority) {
    case 'urgent':
      urgentBtn.classList.add('active');
      break;
    case 'low':
      lowBtn.classList.add('active');
      break;
    default:
      mediumBtn.classList.add('active');
      break;
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
  location.reload();
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
  } catch (error) {
    // Fehlerbehandlung
  }
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
 * Returns the badge class based on a given color.
 * @param {string} colorValue - The color value or name.
 * @returns {string} - The corresponding badge class.
 */
function getBadgeClassFromAnyColor(colorValue) {
  if (!colorValue) {
    colorValue = "default";
  }
  if (colorValue.startsWith('profile-badge-')) {
    return colorValue;
  }
  const lowerValue = colorValue.trim().toLowerCase();
  switch (lowerValue) {
    case 'red':    return 'profile-badge-floating-red';
    case 'orange': return 'profile-badge-floating-orange';
    case 'blue':   return 'profile-badge-floating-blue';
    case 'purple': return 'profile-badge-floating-purple';
    case 'green':  return 'profile-badge-floating-green';
    case 'pink':   return 'profile-badge-floating-pink';
    default:       return 'profile-badge-floating-default';
  }
}

/**
 * Opens the edit task modal from an overlay.
 * @param {Event} event - The event object.
 */
function editTaskFromOverlay(event) {
  event.stopPropagation();
  if (!currentTask) return;
  fillEditModal(currentTask);
  document.getElementById('toggleModalFloating').style.display = 'none';
  const modal = document.getElementById('editTaskModal');
  if (modal) modal.style.display = 'flex';
}

// Event listeners für das Modal und Subtasks
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmEditBtn')?.addEventListener('click', saveEditedTaskToFirebase);
  const subtaskInput = document.querySelector('.subtask-input');
  const subtaskCheck = document.querySelector('.subtask-edit-check');
  const subtasksList = document.getElementById('editSubtasksList');
  subtaskCheck?.addEventListener('click', () => {
    const text = subtaskInput.value.trim();
    if (text !== '') {
      const newSubtask = document.createElement('div');
      newSubtask.className = 'subtask-item';
      newSubtask.innerHTML = `
        <span>• ${text}</span>
        <div class="subtask-actions">
          <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
          <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
        </div>`;
      subtasksList.appendChild(newSubtask);
      subtaskInput.value = '';
    }
  });
  subtasksList?.addEventListener('click', e => {
    if (e.target?.matches('img[alt="Delete"]')) {
      e.target.closest('.subtask-item')?.remove();
    }
  });
});