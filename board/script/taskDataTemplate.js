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
 * Returns an object containing the real users and the total count,
 * even if the last entry is a placeholder such as { name: "+3" }.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {{realUsers: Array<Object>, totalCount: number}} Object with the real users array and total count.
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
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {boolean} newStatus - The new status (true = completed).
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
 * Sets the header area (category) in the modal.
 * @param {Object} task - Task data.
 * @param {HTMLElement} modal - The modal element.
 */
function setCategoryHeader(task, modal) {
  const cat = modal.querySelector('.main-section-task-overlay > div:first-child');
  const isTechnical = task.category.toLowerCase().includes('technical');
  cat.className = `card-label-${isTechnical ? 'technical-task' : 'user-story'}-modal w445`;
  cat.querySelector('h4').textContent = task.category;
}

/**
 * Fills the main fields in the modal.
 * @param {Object} task - Task data.
 */
function setModalFields(task) {
  document.getElementById('modalTitle').innerText = task.title || "No Title";
  document.getElementById('modalDescription').innerText = task.description || "No Description";
  document.getElementById('modalDueDate').innerText = task.dueDate || "No Date";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
}

/**
 * Renders the assigned users in the modal.
 * @param {Object} task - Task data.
 */
function setAssignedUsers(task) {
  const assign = document.getElementById('modalAssignedTo');
  if (task.users && Array.isArray(task.users)) {
    assign.innerHTML = task.users.map(u =>
      `<div class="flexrow profile-names">
         <div class="profile-badge-floating-${u.color || 'gray'}">${u.initials || '?'}</div>
         <span class="account-name">${u.name || 'Unknown'}</span>
       </div>`
    ).join("");
  } else {
    assign.innerHTML = "";
  }
}

/**
 * Renders the complete modal header.
 * @param {Object} task - Task data.
 * @param {HTMLElement} modal - The modal element.
 */
function renderModalHeader(task, modal) {
  setCategoryHeader(task, modal);
  setModalFields(task);
  setAssignedUsers(task);
}

/**
 * Clears the container for subtasks and returns it.
 * @returns {HTMLElement} The subtasks container.
 */
function clearSubtasksContainer() {
  const ms = document.getElementById("modalSubtasks");
  ms.innerHTML = "";
  return ms;
}

/**
 * Creates a single subtask element.
 * @param {Object} st - Subtask data.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement} The subtask element.
 */
function createSubtaskElement(st, index) {
  const div = document.createElement("div");
  div.classList.add("subtask-container-div-item");
  div.innerHTML = `<div class="flexrow">
                     <input type="checkbox" class="subtask-checkbox" data-index="${index}" ${st.completed ? "checked" : ""}>
                     <span>${st.text}</span>
                   </div>`;
  return div;
}

/**
 * Adds change listeners to all subtask checkboxes.
 * @param {HTMLElement} container - The container of subtasks.
 */
function addSubtaskListeners(container) {
  container.querySelectorAll(".subtask-checkbox").forEach(cb => {
    cb.addEventListener("change", function () {
      updateSubtaskStatus(window.currentTaskId, parseInt(this.getAttribute("data-index"), 10), this.checked);
    });
  });
}

/**
 * Renders all subtasks in the modal.
 * @param {Object} task - Task data.
 */
function renderSubtasks(task) {
  const ms = clearSubtasksContainer();
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((st, i) => {
      ms.appendChild(createSubtaskElement(st, i));
    });
    addSubtaskListeners(ms);
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
 * Calculates the progress (in %) and returns the numbers.
 * @param {Object} task - Task data.
 * @returns {{total: number, completed: number, progress: number}} Object with total, completed and progress.
 */
function calculateProgress(task) {
  const total = task.subtasks ? task.subtasks.length : 0;
  const completed = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const progress = total ? (completed / total) * 100 : 0;
  return { total, completed, progress };
}

/**
 * Returns the priority image path based on the task's priority.
 * @param {Object} task - Task data.
 * @returns {string} The image path for the priority.
 */
function getPriorityImage(task) {
  const mapping = {
    urgent: "../img/icon-urgent.png",
    medium: "../img/priority-img/medium.png",
    low: "../img/icon-low.png"
  };
  let prio = extractPriority(task.priority);
  if (!mapping[prio]) prio = "medium";
  return mapping[prio];
}

/**
 * Creates the header HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the header.
 */
function createHeader(task) {
  const labelType = task.category === "Technical task" ? "technical-task" : "user-story";
  const headerTitle = task.category === "Technical task" ? "Technical Task" : "User Story";
  return `
    <div class="card-label-${labelType} padding-left">
      <h4>${headerTitle}</h4>
      <img src="../img/drag-drop-icon.png" alt="drag-and-drop-icon" class="drag-drop-icon">
    </div>`;
}

/**
 * Creates the body HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the body.
 */
function createBody(task) {
  return `
    <div><h5 class="card-label-user-story-h5 padding-left">${task.title}</h5></div>
    <div><h6 class="card-label-user-story-h6 padding-left">${task.description}</h6></div>`;
}

/**
 * Creates the progress section HTML for the task card.
 * @param {number} total - Total number of subtasks.
 * @param {number} completed - Number of completed subtasks.
 * @param {number} progress - Progress percentage.
 * @returns {string} HTML string for the progress section.
 */
function createProgressSection(total, completed, progress) {
  const progressStyle = total > 0 ? "" : "display: none;";
  return `
    <div class="task-progress" style="${progressStyle}">
      <div class="progress-main-container">
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
      </div>
      <span class="progress-text">${completed} / ${total} tasks</span>
    </div>`;
}

/**
 * Creates the footer HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the footer.
 */
function createFooter(task) {
  const userBadges = renderUserBadges(task.users, 3);
  const taskPriority = getPriorityImage(task);
  return `
    <div class="card-footer">
      <div class="padding-left profile-badge-container">
        ${userBadges}
      </div>
      <div class="priority-container-img">
        <img src="${taskPriority}" alt="Priority" 
             onerror="this.src='../img/priority-img/medium.png'" 
             class="priority-container-img">
      </div>
    </div>`;
}

/**
 * Creates the complete task card element.
 * @param {Object} task - Task data.
 * @returns {HTMLElement} The task element.
 */
function createTaskElement(task) {
  const { total, completed, progress } = calculateProgress(task);
  const el = document.createElement("div");
  el.classList.add("draggable-cards");
  el.id = task.firebaseKey || task.id;
  el.setAttribute("draggable", "true");
  el.dataset.title = task.title.toLowerCase();
  el.dataset.description = task.description.toLowerCase();
  el.innerHTML = `
    ${createHeader(task)}
    ${createBody(task)}
    ${createProgressSection(total, completed, progress)}
    ${createFooter(task)}
  `;
  return el;
}

/**
 * Attaches click and dragend listeners to the task element.
 * @param {Object} task - Task data.
 * @param {HTMLElement} taskEl - The task element.
 */
function attachTaskListeners(task, taskEl) {
  taskEl.addEventListener("click", () => openTaskModal(task));
  taskEl.addEventListener("dragend", async function () {
    const newCol = taskEl.closest(".task-board-container")?.id;
    if (newCol) await updateTaskColumnInFirebase(taskEl.id, newCol);
  });
}

/**
 * Attaches the dropdown listener to the task element.
 * @param {HTMLElement} taskEl - The task element.
 */
function attachDropdownListener(taskEl) {
  const ddIcon = taskEl.querySelector('.drag-drop-icon');
  if (!ddIcon) return;
  ddIcon.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleDropdown(taskEl, ddIcon);
  });
}

/**
 * Toggles the dropdown menu or creates it if it does not exist.
 * @param {HTMLElement} taskEl - The task element.
 * @param {HTMLElement} ddIcon - The dropdown icon element.
 */
function toggleDropdown(taskEl, ddIcon) {
  let dd = taskEl.querySelector(".move-to-dropdown");
  if (dd) {
    dd.classList.toggle("visible");
    return;
  }
  dd = createDropdownMenu(ddIcon);
  taskEl.appendChild(dd);
  dd.classList.add("visible");
  attachDropdownOptions(taskEl, dd);
}

/**
 * Creates the dropdown menu with move-to options.
 * @param {HTMLElement} ddIcon - The dropdown icon element.
 * @returns {HTMLElement} The dropdown menu element.
 */
function createDropdownMenu(ddIcon) {
  const dd = document.createElement("div");
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
  return dd;
}

/**
 * Attaches click listeners to the dropdown options.
 * @param {HTMLElement} taskEl - The task element.
 * @param {HTMLElement} dd - The dropdown menu element.
 */
function attachDropdownOptions(taskEl, dd) {
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
    attachTaskListeners(task, taskEl);
    attachDropdownListener(taskEl);
  });
  checkColumns();
}

/**
 * Reads subtasks from the edit modal while preserving their current completed state.
 * @returns {Array<Object>} Array of subtasks.
 */
function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasks = [];
  subtaskItems.forEach((item, index) => {
    const span = item.querySelector('span');
    if (span) {
      const text = span.innerText.replace('• ', '').trim();
      const completed = window.currentTask && window.currentTask.subtasks && window.currentTask.subtasks[index]
        ? window.currentTask.subtasks[index].completed
        : false;
      subtasks.push({ text, completed });
    }
  });
  return subtasks;
}

/**
 * Opens the edit modal from an overlay.
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


/**
 * Creates a new subtask element based on the entered text.
 * @param {string} text - The text of the new subtask.
 * @returns {HTMLElement} The new subtask element.
 */
function createNewSubtask(text) {
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
 * Creates the container element for a subtask.
 * @returns {HTMLElement} The subtask container element.
 */
function createSubtaskContainer() {
  const container = document.createElement("div");
  container.className = "subtask-item";
  return container;
}

/**
 * Creates the checkbox for a subtask.
 * @param {Object} subtask - Subtask data.
 * @returns {HTMLElement} The checkbox element.
 */
function createSubtaskCheckbox(subtask) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "subtask-edit-checkbox";
  checkbox.checked = subtask.completed;
  return checkbox;
}

/**
 * Attaches the edit listener to the edit icon in the actions container.
 * @param {HTMLElement} container - The subtask container element.
 * @param {HTMLElement} span - The span element containing the text.
 * @param {string} originalText - The original text.
 * @param {HTMLElement} actionsDiv - The actions container element.
 */
function attachSubtaskEditListener(container, span, originalText, actionsDiv) {
  const editIcon = actionsDiv.querySelector('.subtask-edit-edit');
  editIcon.addEventListener('click', () => {
    replaceSpanWithInput(container, span, originalText);
  });
}

/**
 * Combines all parts and creates the complete subtask element.
 * @param {Object} subtask - Subtask data.
 * @returns {HTMLElement} The subtask element.
 */
function createSubtaskItem(subtask) {
  const container = createSubtaskContainer();
  const checkbox = createSubtaskCheckbox(subtask);
  const span = createSubtaskTextSpan(subtask.text);
  const actionsDiv = createSubtaskActions();
  
  container.appendChild(checkbox);
  container.appendChild(span);
  container.appendChild(actionsDiv);
  
  attachSubtaskEditListener(container, span, subtask.text, actionsDiv);
  
  return container;
}

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

// Export functions for use in other modules.
export {
  generateTasks,
  openTaskModal,
  updateTaskColumnInFirebase,
  updateSubtaskStatus,
  getPriorityLabel,
  checkColumns,
  enableDragAndDrop
};
