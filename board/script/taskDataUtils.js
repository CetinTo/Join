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