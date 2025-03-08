function fillEditModal(task) {
  document.getElementById('editTaskTitle').value = task.title || "";
  document.getElementById('editTaskDescription').value = task.description || "";
  document.getElementById('editDueDate').value = task.dueDate || "";
  const extractedPrio = extractPriority(task.priority);
  if (typeof setEditPriority === 'function') {
    setEditPriority(extractedPrio);
  }
  document.getElementById('editTaskCategory').value = task.category || "";
  const assigneeBadges = document.getElementById('assigneeBadges');
  if (assigneeBadges && task.users && task.users.length > 0) {
    assigneeBadges.innerHTML = task.users.map(user => `
      <div class="profile-badge-floating-${user.color || 'gray'}">${user.initials || '?'}</div>
    `).join("");
  } else {
    assigneeBadges.innerHTML = "";
  }
  const editSubtasksList = document.getElementById('editSubtasksList');
  editSubtasksList.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    task.subtasks.forEach(st => {
      const stDiv = document.createElement("div");
      stDiv.className = "subtask-item";
      stDiv.innerHTML = `
        <span>• ${st.text}</span>
        <div class="subtask-actions">
          <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
          <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
        </div>
      `;
      editSubtasksList.appendChild(stDiv);
    });
  }
}

async function saveEditedTaskToFirebase() {
  if (!currentTask) {
    return;
  }
  const newTitle = document.getElementById('editTaskTitle').value.trim() || currentTask.title;
  const newDescription = document.getElementById('editTaskDescription').value.trim() || currentTask.description;
  const newDueDate = document.getElementById('editDueDate').value.trim() || currentTask.dueDate;
  const selectedPrio = getSelectedPriority();
  const newPriorityPath = getPriorityPath(selectedPrio);
  const newCategoryValue = document.getElementById('editTaskCategory').value || currentTask.category;
  const newSubtasks = readSubtasksFromEditModal();
  const newAssignees = readAssigneesFromBadges();
  currentTask.title = newTitle;
  currentTask.description = newDescription;
  currentTask.dueDate = newDueDate;
  currentTask.priority = newPriorityPath;
  currentTask.category = (newCategoryValue === 'technical') ? 'Technical task' : 'User Story';
  if (newAssignees.length > 0) {
    currentTask.users = newAssignees;
  }
  if (newSubtasks.length > 0) {
    currentTask.subtasks = newSubtasks;
  }
  await updateTaskInFirebase(currentTask);
  closeEditModal();
  location.reload();
}

async function loadContacts() {
  try {
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    const contacts = await response.json();
    populateAssigneeDropdown(contacts);
  } catch (error) {}
}

function populateAssigneeDropdown(contacts) {
  const dropdownSelected = document.getElementById('assigneeDropdownSelected');
  const dropdownList = document.getElementById('assigneeDropdownList');
  const badgesContainer = document.getElementById('assigneeBadges');
  dropdownList.innerHTML = '';
  const selectedContacts = new Set();
  Object.entries(contacts).forEach(([id, contact]) => {
    const initials = getInitials(contact.name);
    const item = document.createElement('div');
    item.classList.add('dropdown-item');
    item.innerHTML = `
      <div class="contact-info">
        <span class="initials-circle" style="background-color: ${contact.color || '#2a3647'};">
          ${initials}
        </span>
        <span class="contact-name">${contact.name}</span>
      </div>
      <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">
    `;
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      const checkbox = item.querySelector('.custom-checkbox');
      if (!selectedContacts.has(id)) {
        selectedContacts.add(id);
        item.classList.add('selected');
        checkbox.src = "../img/checkboxchecked.png";
        checkbox.style.filter = "brightness(0) invert(1)";
        createContactBadge(contact, id, badgesContainer, selectedContacts);
      } else {
        selectedContacts.delete(id);
        item.classList.remove('selected');
        checkbox.src = "../img/chekbox.png";
        checkbox.style.filter = "";
        const badge = badgesContainer.querySelector(`[data-contact-id="${id}"]`);
        if (badge) {
          badge.remove();
        }
      }
    });
    dropdownList.appendChild(item);
  });
  dropdownSelected.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownList.classList.toggle('hidden');
  });
  document.addEventListener('click', (event) => {
    if (!dropdownList.contains(event.target) && !dropdownSelected.contains(event.target)) {
      dropdownList.classList.add('hidden');
    }
  });
}

function createContactBadge(contact, id, container, selectedContacts) {
  const badge = document.createElement('div');
  badge.className = 'assignee-badge';
  badge.dataset.contactId = id;
  badge.dataset.contactName = contact.name;
  badge.dataset.contactColor = contact.color || '#2a3647';
  badge.textContent = getInitials(contact.name);
  badge.addEventListener('click', () => {
    badge.remove();
    selectedContacts.delete(id);
  });
  container.appendChild(badge);
}

function readAssigneesFromBadges() {
  const badges = document.querySelectorAll('#assigneeBadges .assignee-badge');
  const users = [];
  badges.forEach(badge => {
    users.push({
      name: badge.dataset.contactName,
    });
  });
  return users;
}

function setEditPriority(priority) {
  const allButtons = document.querySelectorAll('.edit-priority-urgent, .edit-priority-medium, .edit-priority-low');
  const selectedButton = document.querySelector(`.edit-priority-${priority}`);
  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    allButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
  }
  validateForm();
}

document.addEventListener('DOMContentLoaded', function() {
  const subtaskInput = document.querySelector('.subtask-input');
  const subtaskCheck = document.querySelector('.subtask-edit-check');
  const subtasksList = document.getElementById('editSubtasksList');
  subtaskCheck.addEventListener('click', function() {
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText !== '') {
      const newSubtask = document.createElement('div');
      newSubtask.className = 'subtask-item';
      newSubtask.innerHTML = `
        <span>• ${subtaskText}</span>
        <div class="subtask-actions">
          <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
          <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
        </div>
      `;
      subtasksList.appendChild(newSubtask);
      subtaskInput.value = '';
    }
  });
  subtasksList.addEventListener('click', function(e) {
    if (e.target && e.target.matches('img[alt="Delete"]')) {
      const subtaskItem = e.target.closest('.subtask-item');
      if (subtaskItem) {
        subtaskItem.remove();
      }
    }
  });
});

function editTaskFromOverlay(event) {
  event.stopPropagation();
  if (currentTask) {
    fillEditModal(currentTask);
  } else {
    return;
  }
  document.getElementById('toggleModalFloating').style.display = 'none';
  const editModal = document.getElementById('editTaskModal');
  if (editModal) {
    editModal.style.display = 'flex';
  }
}

function closeEditModal(event) {
  if (event) {
    event.stopPropagation();
  }
  const modal = document.getElementById('editTaskModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function getSelectedPriority() {
  if (document.querySelector('.edit-priority-urgent.active')) return 'urgent';
  if (document.querySelector('.edit-priority-medium.active')) return 'medium';
  if (document.querySelector('.edit-priority-low.active')) return 'low';
  return 'medium';
}

function getPriorityPath(priority) {
  switch (priority) {
    case 'urgent':
      return '../../img/priority-img/urgent.png';
    case 'medium':
      return '../../img/priority-img/medium.png';
    case 'low':
      return '../../img/priority-img/low.png';
    default:
      return '../../img/priority-img/medium.png';
  }
}

function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasksArray = [];
  subtaskItems.forEach(item => {
    const textSpan = item.querySelector('span');
    if (textSpan) {
      subtasksArray.push({
        text: textSpan.innerText.replace('• ', '').trim(),
        completed: false
      });
    }
  });
  return subtasksArray;
}

function readAssigneesFromBadges() {
  const badges = document.querySelectorAll('#assigneeBadges .assignee-badge');
  const users = [];
  badges.forEach(badge => {
    const name = badge.textContent.trim();
    users.push({ name });
  });
  return users;
}

async function updateTaskInFirebase(task) {
  if (!task || !task.firebaseKey) {
    return;
  }
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${task.firebaseKey}.json`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Update fehlgeschlagen: ${response.statusText}`);
    }
  } catch (error) {}
}

function closeEditModal() {
  const modal = document.getElementById('editTaskModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function saveEditedTaskToFirebase() {
  if (!currentTask) {
    return;
  }
  const newTitle = document.getElementById('editTaskTitle').value.trim();
  const newDescription = document.getElementById('editTaskDescription').value.trim();
  const newDueDate = document.getElementById('editDueDate').value.trim();
  const selectedPrio = getSelectedPriority();
  const newPriorityPath = getPriorityPath(selectedPrio);
  const newCategoryValue = document.getElementById('editTaskCategory').value;
  const newSubtasks = readSubtasksFromEditModal();
  const newAssignees = readAssigneesFromBadges();
  currentTask.title = newTitle;
  currentTask.description = newDescription;
  currentTask.dueDate = newDueDate;
  currentTask.priority = newPriorityPath;
  currentTask.category = (newCategoryValue === 'technical') ? 'Technical task' : 'User Story';
  if (newAssignees.length > 0) {
    currentTask.users = newAssignees;
  }
  if (newSubtasks.length > 0) {
    currentTask.subtasks = newSubtasks;
  }
  await updateTaskInFirebase(currentTask);
  closeEditModal();
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  const confirmEditBtn = document.getElementById('confirmEditBtn');
  if (confirmEditBtn) {
    confirmEditBtn.addEventListener('click', saveEditedTaskToFirebase);
  }
});
