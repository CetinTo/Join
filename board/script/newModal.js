/********************************************
 *  KOMPLETTER CODE MIT FLEXIBLEM FARB-MAPPING
 ********************************************/

// --- Modal-Initialisierung und -Füllung ---

function fillEditModal(task) {
  setTaskFields(task);
  setAssigneeBadges(task);
  setSubtasksList(task);
}

function setTaskFields(task) {
  document.getElementById('editTaskTitle').value = task.title || "";
  document.getElementById('editTaskDescription').value = task.description || "";
  document.getElementById('editDueDate').value = task.dueDate || "";
  const prio = extractPriority(task.priority);
  if (typeof setEditPriority === 'function') {
    setEditPriority(prio);
  }
  document.getElementById('editTaskCategory').value = task.category || "";
}

function setAssigneeBadges(task) {
  const badges = document.getElementById('assigneeBadges');
  console.log('task.users in setAssigneeBadges:', task.users);

  if (badges && task.users && task.users.length > 0) {
    // Bereits zugewiesene User aus "task.users"
    badges.innerHTML = task.users.map(user => {
      console.log('User color is:', user.color);
      const colorValue = user.color || ''; // Kann Hex, Farbname oder Klassenname sein
      const badgeClass = getBadgeClassFromAnyColor(colorValue);
      const initials = user.initials || '?';
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

function setSubtasksList(task) {
  const list = document.getElementById('editSubtasksList');
  list.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length) {
    task.subtasks.forEach(st => {
      const stDiv = document.createElement("div");
      stDiv.className = "subtask-item";
      stDiv.innerHTML = `
        <span>• ${st.text}</span>
        <div class="subtask-actions">
          <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
          <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
        </div>`;
      list.appendChild(stDiv);
    });
  }
}

// --- Speichern und Aktualisieren ---

async function saveEditedTaskToFirebase() {
  if (!currentTask) return;
  updateTaskFromInputs();
  await updateTaskInFirebase(currentTask);
  closeEditModal();
  location.reload();
}

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

  // Assignees mit Farbe übernehmen
  const newAssignees = readAssigneesFromBadges();
  if (newAssignees.length) {
    currentTask.users = newAssignees;
  }
}

async function updateTaskInFirebase(task) {
  if (!task || !task.firebaseKey) return;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${task.firebaseKey}.json`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error(`Update fehlgeschlagen: ${response.statusText}`);
  } catch (error) {
    console.error(error);
  }
}

function closeEditModal(event) {
  if (event) event.stopPropagation();
  const modal = document.getElementById('editTaskModal');
  if (modal) modal.style.display = 'none';
}

// --- Assignee Dropdown und Kontaktverwaltung ---

/**
 * Diese Funktion verarbeitet:
 *  1) Direkt eingetragene Klassennamen (z.B. "profile-badge-FF7043")
 *  2) Hex-Farben (z.B. "#F57C00")
 *  3) Farbnamen (z.B. "orange")
 *  4) Fallback -> "profile-badge-default"
 */
function getBadgeClassFromAnyColor(colorValue) {
  if (!colorValue) {
    return 'profile-badge-default';
  }

  // 1) Falls der Wert schon ein Klassenname ist (z.B. "profile-badge-FF7043")
  if (colorValue.startsWith('profile-badge-')) {
    return colorValue;
  }

  // 2) Falls es ein Hex-Wert ist (#xxxxxx)
  const trimmed = colorValue.trim().toUpperCase();
  if (trimmed.startsWith('#') && trimmed.length === 7) {
    switch (trimmed) {
      case '#F57C00': return 'profile-badge-F57C00'; 
      case '#5C6BC0': return 'profile-badge-5C6BC0';
      case '#4CAF50': return 'profile-badge-4CAF50';
      case '#3F51B5': return 'profile-badge-3F51B5';
      case '#29B6F6': return 'profile-badge-29B6F6';
      case '#FF7043': return 'profile-badge-FF7043';
      default:        return 'profile-badge-default';
    }
  }

  // 3) Falls es ein Farbname ist (z.B. "orange", "purple", ...)
  const lowerName = trimmed.toLowerCase();
  switch (lowerName) {
    case 'orange':  return 'profile-badge-F57C00'; 
    case 'purple':  return 'profile-badge-8E24AA';
    case 'mint':    return 'profile-badge-4CAF50';
    // Falls du noch mehr Namen hast, hier ergänzen
    default:        return 'profile-badge-default';
  }
}

async function loadContacts() {
  try {
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    const contacts = await response.json();
    console.log('Contacts loaded:', contacts);
    populateAssigneeDropdown(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
}

function populateAssigneeDropdown(contacts) {
  const dropdownSelected = document.getElementById('assigneeDropdownSelected');
  const dropdownList = document.getElementById('assigneeDropdownList');
  const badgesContainer = document.getElementById('assigneeBadges');
  dropdownList.innerHTML = "";
  const selectedContacts = new Set();

  // contacts ist vermutlich ein Objekt: { "0": {...}, "1": {...} }
  Object.entries(contacts).forEach(([id, contact]) => {
    dropdownList.appendChild(createDropdownItem(id, contact, selectedContacts, badgesContainer));
  });

  // Toggle per Display-Style
  dropdownSelected.addEventListener('click', event => {
    event.stopPropagation();
    if (dropdownList.style.display === 'block') {
      dropdownList.style.display = 'none';
    } else {
      dropdownList.style.display = 'block';
    }
  });

  // Klick außerhalb -> Dropdown schließen
  document.addEventListener('click', event => {
    if (!dropdownList.contains(event.target) && !dropdownSelected.contains(event.target)) {
      dropdownList.style.display = 'none';
    }
  });
}

function createDropdownItem(id, contact, selectedContacts, badgesContainer) {
  const initials = getInitials(contact.name);
  const colorValue = contact.color || ''; // Kann Hex, Name, Klassenname sein
  const item = document.createElement('div');
  item.classList.add('dropdown-item');
  item.innerHTML = `
    <div class="contact-info">
      <span class="initials-circle" style="background-color: ${colorValue};">
        ${initials}
      </span>
      <span class="contact-name">${contact.name}</span>
    </div>
    <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">`;

  item.addEventListener('click', event => {
    event.stopPropagation();
    handleDropdownSelection(item, id, contact, selectedContacts, badgesContainer);
  });
  return item;
}

function handleDropdownSelection(item, id, contact, selectedContacts, badgesContainer) {
  const checkbox = item.querySelector('.custom-checkbox');
  if (!selectedContacts.has(id)) {
    // Kontakt NEU ausgewählt
    selectedContacts.add(id);
    item.classList.add('selected');
    checkbox.src = "../img/checkboxchecked.png";
    checkbox.style.filter = "brightness(0) invert(1)";
    createContactBadge(contact, id, badgesContainer, selectedContacts);
  } else {
    // Kontakt ABgewählt
    selectedContacts.delete(id);
    item.classList.remove('selected');
    checkbox.src = "../img/chekbox.png";
    checkbox.style.filter = "";
    const badge = badgesContainer.querySelector(`[data-contact-id="${id}"]`);
    if (badge) badge.remove();
  }
}

function createContactBadge(contact, id, container, selectedContacts) {
  const colorValue = contact.color || '';
  const badgeClass = getBadgeClassFromAnyColor(colorValue);

  const badge = document.createElement('div');
  badge.className = `assignee-badge ${badgeClass}`;
  badge.dataset.contactId = id;
  badge.dataset.contactName = contact.name;
  badge.dataset.contactColor = colorValue;
  badge.textContent = getInitials(contact.name);

  // Klick auf das Badge -> entfernen
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
      name: badge.dataset.contactName || badge.textContent.trim(),
      color: badge.dataset.contactColor || ''
    });
  });
  return users;
}

// --- Weitere Hilfsfunktionen und Event-Listener ---

function getSelectedPriority() {
  if (document.querySelector('.edit-priority-urgent.active')) return 'urgent';
  if (document.querySelector('.edit-priority-medium.active')) return 'medium';
  if (document.querySelector('.edit-priority-low.active')) return 'low';
  return 'medium';
}

function getPriorityPath(priority) {
  switch (priority) {
    case 'urgent': return '../../img/priority-img/urgent.png';
    case 'medium': return '../../img/priority-img/medium.png';
    case 'low': return '../../img/priority-img/low.png';
    default: return '../../img/priority-img/medium.png';
  }
}

function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasks = [];
  subtaskItems.forEach(item => {
    const span = item.querySelector('span');
    if (span) {
      subtasks.push({
        text: span.innerText.replace('• ', '').trim(),
        completed: false
      });
    }
  });
  return subtasks;
}

function editTaskFromOverlay(event) {
  event.stopPropagation();
  if (!currentTask) return;
  fillEditModal(currentTask);
  document.getElementById('toggleModalFloating').style.display = 'none';
  const modal = document.getElementById('editTaskModal');
  if (modal) modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
  // Kontakte laden
  loadContacts();

  document.getElementById('confirmEditBtn')?.addEventListener('click', saveEditedTaskToFirebase);

  // Subtask-Logik
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
