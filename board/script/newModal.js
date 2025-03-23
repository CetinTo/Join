/********************************************
 *  KOMPLETTER CODE MIT PRIORITY, CATEGORY
 *  UND ASSIGNEE-DROPDOWN (VORAUSGEWÄHLT)
 ********************************************/

// --- Modal-Initialisierung und -Füllung ---

function fillEditModal(task) {
  setTaskFields(task);
  setAssigneeBadges(task);
  setSubtasksList(task);
  // Kontakte laden und bereits zugewiesene Kontakte (task.users) übergeben
  loadContacts(task.users || []);
}

function setTaskFields(task) {
  document.getElementById('editTaskTitle').value = task.title || "";
  document.getElementById('editTaskDescription').value = task.description || "";
  document.getElementById('editDueDate').value = task.dueDate || "";

  // Priority aus dem Pfad extrahieren und den Button aktivieren
  const prio = extractPriority(task.priority);
  setEditPriority(prio);

  // Kategorie: "Technical task" oder "User Story" -> Select-Wert
  if (task.category === 'Technical task') {
    document.getElementById('editTaskCategory').value = 'technical';
  } else if (task.category === 'User Story') {
    document.getElementById('editTaskCategory').value = 'userstory';
  } else {
    document.getElementById('editTaskCategory').value = '';
  }
}

function setAssigneeBadges(task) {
  const badges = document.getElementById('assigneeBadges');
  if (badges && task.users && task.users.length > 0) {
    badges.innerHTML = task.users.map(user => {
      // Falls kein Farbwert vorhanden – Standard
      let colorValue = user.color || "default";
      // Falls ein Hex-Code übergeben wird, umwandeln in Farbnamen
      if (colorValue.startsWith('#')) {
        switch(colorValue.toUpperCase()) {
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

// --- Priority-Handling ---

function extractPriority(priorityPath) {
  if (!priorityPath) return 'medium';
  const lowerPath = priorityPath.toLowerCase();
  if (lowerPath.includes('urgent')) return 'urgent';
  if (lowerPath.includes('low')) return 'low';
  return 'medium';
}

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
// Hier wird nun als "color" ein einfacher Name (red, orange, blue, purple, green, pink) erwartet.

function getBadgeClassFromAnyColor(colorValue) {
  // Falls kein Wert vorhanden, Default:
  if (!colorValue) {
    colorValue = "default";
  }
  // Falls bereits ein Klassenname vorliegt:
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
 * Lade Kontakte aus Firebase und übergebe die bereits zugewiesenen User.
 * @param {Array} assignedUsers - Array mit Objekten {name, color, initials}
 */
async function loadContacts(assignedUsers = []) {
  try {
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    const contacts = await response.json();
    console.log('Contacts loaded:', contacts);
    populateAssigneeDropdown(contacts, assignedUsers);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
}

function populateAssigneeDropdown(contacts, assignedUsers) {
  const dropdownSelected = document.getElementById('assigneeDropdownSelected');
  const dropdownList = document.getElementById('assigneeDropdownList');
  const badgesContainer = document.getElementById('assigneeBadges');
  dropdownList.innerHTML = "";
  
  // Erstelle ein Set mit bereits zugewiesenen Namen (normalisiert)
  const assignedUserNames = new Set(
    assignedUsers.map(u => u.name.trim().toLowerCase())
  );
  console.log("Assigned user names:", Array.from(assignedUserNames));
  
  const selectedContacts = new Set();
  
  Object.entries(contacts).forEach(([id, contact]) => {
    const item = createDropdownItem(id, contact, selectedContacts, badgesContainer);
    dropdownList.appendChild(item);
    
    // Vergleiche den Kontakt-Namen case-insensitive
    const contactName = contact.name.trim().toLowerCase();
    console.log("Checking contact:", contactName);
    if (assignedUserNames.has(contactName)) {
      selectedContacts.add(id);
      item.classList.add('selected');
      const checkbox = item.querySelector('.custom-checkbox');
      checkbox.src = "../img/checkboxchecked.png";
      checkbox.style.filter = "brightness(0) invert(1)";
      // Badge sofort erstellen, falls noch nicht vorhanden
      createContactBadge(contact, id, badgesContainer, selectedContacts);
    }
  });
  
  dropdownSelected.addEventListener('click', event => {
    event.stopPropagation();
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
  });
  
  document.addEventListener('click', event => {
    if (!dropdownList.contains(event.target) && !dropdownSelected.contains(event.target)) {
      dropdownList.style.display = 'none';
    }
  });
}

function createDropdownItem(id, contact, selectedContacts, badgesContainer) {
  const initials = getInitials(contact.name);
  const colorValue = contact.color || "default";
  // Wenn der Farbwert ein Hex-Code ist, wandeln wir ihn um:
  let simpleColor = colorValue;
  if (colorValue.startsWith('#')) {
    switch(colorValue.toUpperCase()) {
      case '#F57C00': simpleColor = 'orange'; break;
      case '#E74C3C': simpleColor = 'red'; break;
      case '#5C6BC0': simpleColor = 'blue'; break;
      case '#4CAF50': simpleColor = 'green'; break;
      case '#8E44AD': simpleColor = 'purple'; break;
      case '#EE00FF': simpleColor = 'pink'; break;
      default: simpleColor = 'default'; break;
    }
  }
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
    if (badge) badge.remove();
  }
}

function createContactBadge(contact, id, container, selectedContacts) {
  const colorValue = contact.color || "default";
  let simpleColor = colorValue;
  if (colorValue.startsWith('#')) {
    switch(colorValue.toUpperCase()) {
      case '#F57C00': simpleColor = 'orange'; break;
      case '#E74C3C': simpleColor = 'red'; break;
      case '#5C6BC0': simpleColor = 'blue'; break;
      case '#4CAF50': simpleColor = 'green'; break;
      case '#8E44AD': simpleColor = 'purple'; break;
      case '#EE00FF': simpleColor = 'pink'; break;
      default: simpleColor = 'default'; break;
    }
  }
  const badgeClass = getBadgeClassFromAnyColor(simpleColor);
  
  // Verhindere doppelte Badges
  if (container.querySelector(`[data-contact-id="${id}"]`)) return;
  
  const badge = document.createElement('div');
  badge.className = `assignee-badge ${badgeClass}`;
  badge.dataset.contactId = id;
  badge.dataset.contactName = contact.name;
  badge.dataset.contactColor = simpleColor;
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
      name: badge.dataset.contactName || badge.textContent.trim(),
      color: badge.dataset.contactColor || "default"
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
    case 'low':    return '../../img/priority-img/low.png';
    default:       return '../../img/priority-img/medium.png';
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
