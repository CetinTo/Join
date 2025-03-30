/** @type {Array<Object>} Stores currently selected contacts */
let selectedContacts = [];

/** @type {Array<Object>} Stores all contacts loaded from Firebase */
let contactsArray = [];

/**
 * Loads contacts from Firebase and initializes the dropdown
 * @async
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  try {
    const contacts = await fetchContactsFromFirebase();
    if (!contacts) return;
    contactsArray = Object.values(contacts);
    const dropdownList = document.querySelector(".dropdown-list"),
          searchInput = document.querySelector(".dropdown-search");
    if (!dropdownList || !searchInput) return;
    initializeDropdown(dropdownList, searchInput);
    populateDropdown(dropdownList);
    addSearchListener(searchInput);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Fetches contact data from Firebase
 * @async
 * @returns {Promise<Object>} The contact data or undefined on error
 * @throws {Error} If the fetch request fails
 */
async function fetchContactsFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Loading error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Initializes the dropdown by resetting the list and search field
 * @param {HTMLElement} dropdownList - The dropdown list element
 * @param {HTMLInputElement} searchInput - The search input element
 */
function initializeDropdown(dropdownList, searchInput) {
  dropdownList.innerHTML = "";
  searchInput.value = "";
}

/**
 * Populates the dropdown with contacts from contactsArray
 * @param {HTMLElement} dropdownList - The dropdown list element
 */
function populateDropdown(dropdownList) {
  contactsArray.forEach(contact => {
    const div = createContactItem(contact);
    dropdownList.appendChild(div);
  });
}

/**
 * Creates a single contact item for the dropdown
 * @param {Object} contact - The contact object
 * @returns {HTMLElement} The created contact element
 */
function createContactItem(contact) {
  const div = document.createElement("div");
  div.classList.add("dropdown-item");
  div.innerHTML = getContactMarkup(contact);
  const checkboxImg = div.querySelector(".custom-checkbox");
  addContactListeners(div, checkboxImg, contact);
  return div;
}

/**
 * Generates HTML markup for a contact item
 * @param {Object} contact - The contact object
 * @returns {string} The HTML markup as a string
 */
function getContactMarkup(contact) {
  const initials = getInitials(contact.name);
  const colorClass = getColorClass(contact.name, contactsArray);
  return `
    <div class="contact-info">
      <span class="contact-initials profile-badge ${colorClass}">${initials}</span>
      <span class="contact-name">${contact.name}</span>
    </div>
    <input type="checkbox" class="contact-checkbox" data-name="${contact.name}" hidden>
    <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">
  `;
}

/**
 * Adds event listeners to contact items
 * @param {HTMLElement} div - The contact element
 * @param {HTMLImageElement} checkboxImg - The checkbox image
 * @param {Object} contact - The contact object
 */
function addContactListeners(div, checkboxImg, contact) {
  div.addEventListener("click", evt => {
    evt.stopPropagation();
    toggleCheckboxState(contact, checkboxImg, div);
  });
  checkboxImg.addEventListener("click", evt => {
    evt.stopPropagation();
    toggleCheckboxState(contact, checkboxImg, div);
  });
}

/**
 * Adds a search listener to filter contacts
 * @param {HTMLInputElement} searchInput - The search input element
 */
function addSearchListener(searchInput) {
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    document.querySelectorAll(".dropdown-item").forEach(item => {
      const contactName = item.querySelector(".contact-name").textContent.toLowerCase();
      item.style.display = contactName.includes(searchTerm) ? "flex" : "none";
    });
  });
}

/**
 * Extracts initials from a full name
 * @param {string} fullName - The full name
 * @returns {string} The initials in uppercase
 */
function getInitials(fullName) {
  if (!fullName) return "??";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Toggles the selection state of a contact
 * @param {Object} contact - The contact object
 * @param {HTMLImageElement} checkboxImg - The checkbox image
 * @param {HTMLElement} div - The contact element
 */
function toggleCheckboxState(contact, checkboxImg, div) {
  const isSelected = selectedContacts.some(c => c.name === contact.name);

  if (!isSelected) {
    selectedContacts.push(contact);
    checkboxImg.src = "../img/checkboxchecked.png";
    div.classList.add("selected");
  } else {
    selectedContacts = selectedContacts.filter(c => c.name !== contact.name);
    checkboxImg.src = "../img/chekbox.png";
    div.classList.remove("selected");
  }

  updateAssignedToProfile();
}

/**
 * Updates the display of assigned profiles
 */
function updateAssignedToProfile() {
  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  assignedContainer.innerHTML = "";
  
  const maxVisible = 3; // maximal sichtbare Profile
  
  if (selectedContacts.length <= maxVisible) {
    // Zeige alle Kontakte, wenn es 3 oder weniger sind
    selectedContacts.forEach(contact => {
      const initials = getInitials(contact.name);
      const colorClass = getColorClass(contact.name, contactsArray);
      const profileBubble = document.createElement("div");
      profileBubble.classList.add("profile-badge", colorClass);
      profileBubble.textContent = initials;
      assignedContainer.appendChild(profileBubble);
    });
  } else {
    // Zeige die ersten 3 Kontakte
    selectedContacts.slice(0, maxVisible).forEach(contact => {
      const initials = getInitials(contact.name);
      const colorClass = getColorClass(contact.name, contactsArray);
      const profileBubble = document.createElement("div");
      profileBubble.classList.add("profile-badge", colorClass);
      profileBubble.textContent = initials;
      assignedContainer.appendChild(profileBubble);
    });
    // Füge eine Bubble mit der Anzahl der restlichen Kontakte hinzu
    const extraCount = selectedContacts.length - maxVisible;
    const extraBubble = document.createElement("div");
    extraBubble.classList.add("profile-badge", "extra-bubble");
    extraBubble.textContent = `+${extraCount}`;
    assignedContainer.appendChild(extraBubble);
  }
}


/**
 * Determines the color class for a contact profile
 * @param {string} name - The contact's name
 * @param {Array<Object>} contacts - Array of all contacts
 * @returns {string} The CSS class name for the color
 */
function getColorClass(name, contacts) {
  const contact = contacts.find(c => c.name === name);
  return contact && contact.color ? `profile-badge-${contact.color.replace("#", "")}` : 'profile-badge-default';
}

/**
 * Toggles the dropdown visibility
 * @param {Event} [event] - The triggering event
 */
function toggleDropdown(event) {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.querySelector(".dropdown-list");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (!event || !dropdown.contains(event.target)) {
    closeDropdown();
    return;
  }

  if (dropdown.classList.contains("active")) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

/**
 * Opens the dropdown menu
 */
function openDropdown() {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.querySelector(".dropdown-list");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  dropdown.classList.add("active");
  dropdownList.style.display = "block";
  arrowClosed.style.display = "none";
  arrowOpen.style.display = "block";
}

/**
 * Closes the dropdown menu
 */
function closeDropdown() {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.querySelector(".dropdown-list");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  dropdown.classList.remove("active");
  dropdownList.style.display = "none";
  arrowClosed.style.display = "block";
  arrowOpen.style.display = "none";
}

/**
 * Validates the form and enables/disables the create button
 * @returns {boolean} Returns whether the form is valid
 */
function validateForm() {
  const title = document.querySelector(".input").value.trim();
  const dueDate = document.querySelector(".date-input").value.trim();
  const category = document.querySelector(".select-task").value;
  const assignedUsers = selectedContacts.length > 0;
  const prioritySelected = document.querySelector(".priority-container .active") !== null;

  const createBtn = document.querySelector(".create-btn");

  if (title && dueDate && category && assignedUsers && prioritySelected) {
    createBtn.classList.remove("disabled");
    createBtn.style.pointerEvents = "auto";
    createBtn.style.opacity = "1";
    return true;
  } else {
    createBtn.classList.add("disabled");
    createBtn.style.pointerEvents = "none";
    createBtn.style.opacity = "0.5";
    return false;
  }
}

// ---------------------------
// Event Listener Registrations
// ---------------------------

/** Closes dropdown when clicking outside */
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".custom-dropdown");
  if (!dropdown.contains(event.target)) {
    closeDropdown();
  }
});

/** Initializes dropdown and event listeners on DOM ready */
document.addEventListener("DOMContentLoaded", function () {
  loadContactsFromFirebase();

  const dropdownSearch = document.querySelector(".dropdown-search");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  dropdownSearch.addEventListener("click", toggleDropdown);
  arrowClosed.addEventListener("click", toggleDropdown);
  arrowOpen.addEventListener("click", toggleDropdown);
});

/** Sets up validation and task creation */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".create-btn").addEventListener("click", function () {
    if (validateForm()) {
      addTaskToFirebase(); // assumed to exist
    }
  });

  document.querySelector(".input").addEventListener("input", validateForm);
  document.querySelector(".date-input").addEventListener("input", validateForm);
  document.querySelector(".select-task").addEventListener("change", validateForm);
  document.querySelector(".priority-container").addEventListener("click", validateForm);

  const assignedContainer = document.querySelector(".assigned-to-profiles-container");

  if (assignedContainer) {
    const observer = new MutationObserver(validateForm);
    observer.observe(assignedContainer, { childList: true });
  }

  validateForm();
});
