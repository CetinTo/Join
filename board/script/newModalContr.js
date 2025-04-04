/**
 * Loads contacts from Firebase and populates the assignee dropdown.
 * @param {Array} [assignedUsers=[]] - Array of already assigned users.
 */
async function loadContacts(assignedUsers = []) {
  try {
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    const contacts = await response.json();
    populateAssigneeDropdown(contacts, assignedUsers);
  } catch (error) {
    // Fehlerbehandlung
  }
}

/**
 * Populates the assignee dropdown with contacts.
 * @param {Object} contacts - The contacts object from Firebase.
 * @param {Array} assignedUsers - Array of already assigned users.
 */
function populateAssigneeDropdown(contacts, assignedUsers) {
  const dropdownSelected = document.getElementById('assigneeDropdownSelected');
  const dropdownList = document.getElementById('assigneeDropdownList');
  const badgesContainer = document.getElementById('assigneeBadges');
  dropdownList.innerHTML = "";
  const assignedUserNames = new Set(
    assignedUsers.map(u => u.name.trim().toLowerCase())
  );
  const selectedContacts = new Set();
  Object.entries(contacts).forEach(([id, contact]) => {
    const item = createDropdownItem(id, contact, selectedContacts, badgesContainer);
    dropdownList.appendChild(item);
    const contactName = contact.name.trim().toLowerCase();
    if (assignedUserNames.has(contactName)) {
      selectedContacts.add(id);
      item.classList.add('selected');
      const checkbox = item.querySelector('.custom-checkbox');
      checkbox.src = "../img/checkboxchecked.png";
      checkbox.style.filter = "brightness(0) invert(1)";
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

/**
 * Creates a dropdown item for a contact.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container element for badges.
 * @returns {HTMLElement} - The dropdown item element.
 */
function createDropdownItem(id, contact, selectedContacts, badgesContainer) {
  const initials = getInitials(contact.name);
  const colorValue = contact.color || "default";
  let simpleColor = colorValue;
  if (colorValue.startsWith('#')) {
    switch (colorValue.toUpperCase()) {
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

/**
 * Handles the selection of a dropdown item.
 * @param {HTMLElement} item - The dropdown item element.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container element for badges.
 */
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

/**
 * Creates a contact badge and appends it to the container.
 * @param {Object} contact - The contact object.
 * @param {string} id - The contact ID.
 * @param {HTMLElement} container - The container element for the badge.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 */
function createContactBadge(contact, id, container, selectedContacts) {
  const colorValue = contact.color || "default";
  let simpleColor = colorValue;
  if (colorValue.startsWith('#')) {
    switch (colorValue.toUpperCase()) {
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

/**
 * Reads the assignees from the badges.
 * @returns {Array<Object>} Array of user objects with name and color.
 */
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
 * Reads subtasks from the edit modal.
 * @returns {Array<Object>} Array of subtasks.
 */
function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasks = [];
  subtaskItems.forEach(item => {
    const checkbox = item.querySelector('.subtask-edit-checkbox');
    const span = item.querySelector('span');
    if (span) {
      subtasks.push({
        text: span.innerText.replace('• ', '').trim(),
        completed: checkbox ? checkbox.checked : false
      });
    }
  });
  return subtasks;
}
