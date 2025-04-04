/**
 * @global
 * @type {Object|null}
 */
window.currentTask = null;

/**
 * @global
 * @type {string|null}
 */
window.currentTaskId = null;

/**
 * Returns an object containing the real users and total count,
 * even if the last entry is a placeholder like { name: "+3" }.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {{realUsers: Array<Object>, totalCount: number}} Object with realUsers array and totalCount.
 */
function getRealUserArrayAndCount(users) {
  if (!users || !Array.isArray(users)) {
    return { realUsers: [], totalCount: 0 };
  }
  let placeholderCount = 0;
  const last = users[users.length - 1];
  if (last && typeof last.name === 'string' && last.name.trim().startsWith('+')) {
    const parsed = parseInt(last.name.trim().replace('+', ''));
    if (!isNaN(parsed)) {
      placeholderCount = parsed;
      users = users.slice(0, users.length - 1);
    }
  }
  return {
    realUsers: users,
    totalCount: users.length + placeholderCount
  };
}

/**
 * Renders the user badges for a task.
 * @param {Array<Object>} users - Array of user objects.
 * @param {number} [maxToShow=3] - Maximum number of badges to display.
 * @returns {string} HTML string representing the badges.
 */
function renderUserBadges(users, maxToShow = 3) {
  const { realUsers, totalCount } = getRealUserArrayAndCount(users);
  let badges = '';
  realUsers.slice(0, maxToShow).forEach(u => {
    const initials = u.initials || '?';
    badges += `<div class="profile-badge-floating-${u.color || 'gray'}">${initials}</div>`;
  });
  if (totalCount > maxToShow) {
    badges += `<div class="profile-badge-floating-gray">+${totalCount - maxToShow}</div>`;
  }
  return badges;
}

/**
 * Updates the status of a subtask and adjusts the progress accordingly.
 * @param {string} taskId - ID of the task.
 * @param {number} subtaskIndex - Index of the subtask.
 * @param {boolean} newStatus - New status (true = completed).
 */
function updateSubtaskStatus(taskId, subtaskIndex, newStatus) {
  if (!window.currentTask || window.currentTaskId !== taskId) return;
  window.currentTask.subtasks[subtaskIndex].completed = newStatus;
  const total = window.currentTask.subtasks.length;
  const completed = window.currentTask.subtasks.filter(st => st.completed).length;
  const newProgress = total ? (completed / total) * 100 : 0;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtasks: window.currentTask.subtasks, progress: newProgress })
  }).then(r => {
    if (!r.ok) throw new Error("Error updating subtask status.");
  }).catch(() => {});
}

/**
 * Returns a textual label for the priority based on the icon path.
 * @param {string} iconPath - Path of the priority icon.
 * @returns {string} Priority label.
 */
function getPriorityLabel(iconPath) {
  if (!iconPath) return "Unknown";
  if (iconPath.includes("urgent")) return "Urgent";
  if (iconPath.includes("medium")) return "Medium";
  if (iconPath.includes("low")) return "Low";
  return "Unknown";
}

/**
 * Extracts the priority from the icon path.
 * @param {string} iconPath - Path of the priority icon.
 * @returns {string} Extracted priority.
 */
function extractPriority(iconPath) {
  if (!iconPath) return 'medium';
  const lower = iconPath.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}
window.extractPriority = extractPriority;

/**
 * Renders the header of the task modal based on the task data.
 * @param {Object} task - The task data.
 * @param {HTMLElement} modal - The modal element.
 */
function renderModalHeader(task, modal) {
  const cat = modal.querySelector('.main-section-task-overlay > div:first-child');
  cat.className = `card-label-${task.category.toLowerCase().includes('technical') ? 'technical-task' : 'user-story'}-modal w445`;
  cat.querySelector('h4').textContent = task.category;
  document.getElementById('modalTitle').innerText = task.title || "No Title";
  document.getElementById('modalDescription').innerText = task.description || "No Description";
  document.getElementById('modalDueDate').innerText = task.dueDate || "No Date";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
  const assign = document.getElementById('modalAssignedTo');
  assign.innerHTML = task.users && Array.isArray(task.users)
    ? task.users.map(u =>
        `<div class="flexrow profile-names">
           <div class="profile-badge-floating-${u.color || 'gray'}">${u.initials || '?'}</div>
           <span class="account-name">${u.name || 'Unknown'}</span>
         </div>`
      ).join("")
    : "";
}

/**
 * Renders the subtasks in the task modal.
 * @param {Object} task - The task data.
 */
function renderSubtasks(task) {
  const ms = document.getElementById("modalSubtasks");
  ms.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((st, i) => {
      const div = document.createElement("div");
      div.classList.add("subtask-container-div-item");
      div.innerHTML = `<div class="flexrow">
                         <input type="checkbox" class="subtask-checkbox" data-index="${i}" ${st.completed ? "checked" : ""}>
                         <span>${st.text}</span>
                       </div>`;
      ms.appendChild(div);
    });
    ms.querySelectorAll(".subtask-checkbox").forEach(cb => {
      cb.addEventListener("change", function () {
        updateSubtaskStatus(window.currentTaskId, parseInt(this.getAttribute("data-index"), 10), this.checked);
      });
    });
  }
}

/**
 * Opens the task modal and populates it with the task data.
 * @param {Object} task - The task to be opened.
 */
function openTaskModal(task) {
  window.currentTask = task;
  window.currentTaskId = task.firebaseKey || task.id;
  const modal = document.getElementById('toggleModalFloating');
  modal.dataset.taskId = window.currentTaskId;
  renderModalHeader(task, modal);
  renderSubtasks(task);
  modal.style.display = 'flex';
}

/**
 * Updates the column of a task in Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {string} newColumn - The new column ID.
 * @returns {Promise<void>}
 */
async function updateTaskColumnInFirebase(taskId, newColumn) {
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: newColumn })
    });
    if (!r.ok) throw new Error(`Error updating task column: ${r.statusText}`);
  } catch (e) {}
}

/**
 * Checks all columns and toggles the placeholder image based on task presence.
 */
function checkColumns() {
  document.querySelectorAll('.task-board-container').forEach(col => {
    const img = col.querySelector('img');
    if (!img) return;
    const hasTasks = col.querySelectorAll('.draggable-cards').length > 0;
    img.style.display = hasTasks ? 'none' : 'block';
  });
}

/**
 * Enables drag & drop functionality for tasks.
 */
function enableDragAndDrop() {
  document.querySelectorAll('.draggable-cards').forEach(card => {
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll('.task-board-container').forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      const dragCard = document.querySelector('.dragging');
      if (dragCard) col.appendChild(dragCard);
    });
  });
}

/**
 * Creates a DOM element for a task.
 * @param {Object} task - The task data.
 * @returns {HTMLElement} The created task element.
 */
function createTaskElement(task) {
  const total = task.subtasks ? task.subtasks.length : 0;
  const completed = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const progress = total ? (completed / total) * 100 : 0;
  const mapping = {
    urgent: "../img/icon-urgent.png",
    medium: "../img/priority-img/medium.png",
    low: "../img/icon-low.png"
  };
  let prio = extractPriority(task.priority);
  if (!mapping[prio]) prio = "medium";
  const taskPriority = mapping[prio];
  const userBadges = renderUserBadges(task.users, 3);
  const progressStyle = total > 0 ? "" : "display: none;";
  const el = document.createElement("div");
  el.classList.add("draggable-cards");
  el.id = task.firebaseKey || task.id;
  el.setAttribute("draggable", "true");
  el.dataset.title = task.title.toLowerCase();
  el.dataset.description = task.description.toLowerCase();
  el.innerHTML = `
    <div class="card-label-${task.category === "Technical task" ? "technical-task" : "user-story"} padding-left">
      <h4>${task.category === "Technical task" ? "Technical Task" : "User Story"}</h4>
      <img src="../img/drag-drop-icon.png" alt="drag-and-drop-icon" class="drag-drop-icon">
    </div>
    <div><h5 class="card-label-user-story-h5 padding-left">${task.title}</h5></div>
    <div><h6 class="card-label-user-story-h6 padding-left">${task.description}</h6></div>
    <div class="task-progress" style="${progressStyle}">
      <div class="progress-main-container">
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
      </div>
      <span class="progress-text">${completed} / ${total} tasks</span>
    </div>
    <div class="card-footer">
      <div class="padding-left profile-badge-container">
        ${userBadges}
      </div>
      <div class="priority-container-img">
        <img src="${taskPriority}" alt="Priority" onerror="this.src='../img/priority-img/medium.png'" class="priority-container-img">
      </div>
    </div>`;
  return el;
}

/**
 * Generates all task elements and inserts them into their respective columns.
 * @param {Array<Object>} tasksData - Array of task data.
 */
function generateTasks(tasksData) {
  tasksData.forEach(task => {
    if (!task || !task.title || !task.column) return;
    const taskEl = createTaskElement(task);
    const col = document.getElementById(task.column);
    if (col) col.appendChild(taskEl);
    taskEl.addEventListener("click", () => openTaskModal(task));
    taskEl.addEventListener("dragend", async function () {
      const newCol = taskEl.closest(".task-board-container")?.id;
      if (newCol) await updateTaskColumnInFirebase(taskEl.id, newCol);
    });
    const ddIcon = taskEl.querySelector('.drag-drop-icon');
    if (ddIcon) {
      ddIcon.addEventListener("click", function (e) {
        e.stopPropagation();
        let dd = taskEl.querySelector(".move-to-dropdown");
        if (dd) {
          dd.classList.toggle("visible");
          return;
        }
        dd = document.createElement("div");
        dd.classList.add("move-to-dropdown");
        dd.innerHTML = `
          <div class="dropdown-header">Move To</div>
          <div class="dropdown-option" data-status="toDoColumn">To do</div>
          <div class="dropdown-option" data-status="inProgress">In Progress</div>
          <div class="dropdown-option" data-status="awaitFeedback">Await Feedback</div>
          <div class="dropdown-option" data-status="done">Done</div>
        `;
        const offsetTop = ddIcon.offsetTop + ddIcon.offsetHeight;
        const offsetLeft = ddIcon.offsetLeft;
        dd.style.position = "absolute";
        dd.style.top = `${offsetTop}px`;
        dd.style.left = `${offsetLeft}px`;
        dd.style.zIndex = 10;
        taskEl.appendChild(dd);
        dd.classList.add("visible");
        dd.querySelectorAll(".dropdown-option").forEach(option => {
          option.addEventListener("click", async function (ev) {
            ev.stopPropagation();
            const ns = option.dataset.status;
            await updateTaskColumnInFirebase(taskEl.id, ns);
            const newCol = document.getElementById(ns);
            if (newCol) newCol.appendChild(taskEl);
            dd.classList.remove("visible");
            checkColumns();
          });
        });
      });
    }
  });
  checkColumns();
}

/**
 * Reads subtasks from the edit modal.
 * Instead of defaulting completed to false, it preserves the current completed state.
 * @returns {Array<Object>} Array of subtasks.
 */
function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasks = [];
  subtaskItems.forEach((item, index) => {
    const span = item.querySelector('span');
    if (span) {
      const text = span.innerText.replace('• ', '').trim();
      // Den aktuellen Status aus window.currentTask übernehmen, falls vorhanden.
      const completed = window.currentTask && window.currentTask.subtasks && window.currentTask.subtasks[index]
        ? window.currentTask.subtasks[index].completed
        : false;
      subtasks.push({ text, completed });
    }
  });
  return subtasks;
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
      newSubtask.dataset.index = window.currentTask.subtasks ? window.currentTask.subtasks.length : 0;
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
    task.subtasks.forEach((subtask, index) => {
      const subtaskItem = createSubtaskItem(subtask);
      subtaskItem.dataset.index = index;
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
  
  // Checkbox für den Completed-Status
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "subtask-edit-checkbox";
  checkbox.checked = subtask.completed;

  const span = createSubtaskTextSpan(subtask.text);
  
  const actionsDiv = createSubtaskActions();
  stDiv.appendChild(checkbox);
  stDiv.appendChild(span);
  stDiv.appendChild(actionsDiv);
  
  // Edit-Icon-Event zum Bearbeiten des Textes
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
 * Updates the underlying currentTask.subtasks entry immediately on blur.
 * @param {HTMLElement} container - The parent element of the subtask.
 * @param {HTMLElement} span - The current text element.
 * @param {string} originalText - The original text.
 */
function replaceSpanWithInput(container, span, originalText) {
  const currentText = span.innerText.replace('• ', '');
  const input = createEditInput(currentText);
  container.replaceChild(input, span);
  input.focus();
  input.addEventListener('blur', async () => {
    const newText = input.value.trim();
    const finalText = newText !== '' ? newText : originalText;
    const newSpan = createSubtaskTextSpan(finalText);
    container.replaceChild(newSpan, input);
    const index = container.dataset.index;
    if (window.currentTask && window.currentTask.subtasks && index !== undefined) {
      window.currentTask.subtasks[index].text = finalText;
      // Direktes Speichern des aktualisierten Tasks (inklusive Subtasks)
      await updateTaskInFirebase(window.currentTask);
    }
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
 * Returns the currently selected priority.
 * @returns {string} - The selected priority.
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
 * @returns {string} - The image path for the priority.
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
  // location.reload() entfernt, um Änderungen sofort sichtbar zu machen.
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
      newSubtask.dataset.index = window.currentTask.subtasks ? window.currentTask.subtasks.length : 0;
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

// Exportiere die Funktionen, damit sie in anderen Modulen verwendet werden können.
export {
  generateTasks,
  openTaskModal,
  updateTaskColumnInFirebase,
  updateSubtaskStatus,
  getPriorityLabel,
  checkColumns,
  enableDragAndDrop
};