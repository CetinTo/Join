/**
 * @fileOverview Main file for contact management, dropdown interactions, and form validation.
 */

import { createDropdownItem } from './template.js'; // Import the template function

/* =============================== */
/*         Global Variables        */
/* =============================== */

/**
 * Array of currently selected contacts.
 * @type {Array<Object>}
 */
let selectedContacts = [];

/**
 * Array of all contacts loaded from Firebase.
 * @type {Array<Object>}
 */
let contactsArray = [];

/* =============================== */
/*         Data Loading            */
/* =============================== */

/**
 * Loads contacts from Firebase and initializes the dropdown list and search.
 * @async
 * @function loadContactsFromFirebase
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error loading: ${response.status} ${response.statusText}`);
    }

    const contacts = await response.json();
    if (!contacts) return;

    contactsArray = Object.values(contacts);
    initDropdownList();
    initDropdownSearch();
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/* =============================== */
/*       Dropdown Functions        */
/* =============================== */

/**
 * Initializes the dropdown list with the loaded contacts.
 * @function initDropdownList
 */
function initDropdownList() {
  const dropdownList = document.querySelector(".dropdown-list");
  const searchInput = document.querySelector(".dropdown-search");
  if (!dropdownList || !searchInput) return;

  dropdownList.innerHTML = "";
  searchInput.value = "";

  contactsArray.forEach(contact => {
    // Pass getInitials, a wrapper for getColorClass (with contactsArray), and toggleCheckboxState.
    const item = createDropdownItem(
      contact,
      getInitials,
      (name) => getColorClass(name, contactsArray),
      toggleCheckboxState
    );
    dropdownList.appendChild(item);
  });
}

/**
 * Initializes the search functionality in the dropdown.
 * @function initDropdownSearch
 */
function initDropdownSearch() {
  const searchInput = document.querySelector(".dropdown-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    document.querySelectorAll(".dropdown-item").forEach(item => {
      const contactName = item.querySelector(".contact-name").textContent.toLowerCase();
      item.style.display = contactName.includes(searchTerm) ? "flex" : "none";
    });
  });
}

/**
 * Toggles the dropdown (opens or closes).
 * @function toggleDropdown
 * @param {Event} event - The triggering event.
 */
function toggleDropdown(event) {
  const dropdown = document.querySelector(".custom-dropdown");
  if (!dropdown) return;

  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  // Close the dropdown if clicked outside.
  if (!event || !dropdown.contains(event.target)) {
    closeDropdown();
    return;
  }

  dropdown.classList.contains("active") ? closeDropdown() : openDropdown();
}

/**
 * Opens the dropdown and updates the arrow display.
 * @function openDropdown
 */
function openDropdown() {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.querySelector(".dropdown-list");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  if (!dropdown || !dropdownList || !arrowClosed || !arrowOpen) return;

  dropdown.classList.add("active");
  dropdownList.style.display = "block";
  arrowClosed.style.display = "none";
  arrowOpen.style.display = "block";
}

/**
 * Closes the dropdown and resets the arrow display.
 * @function closeDropdown
 */
function closeDropdown() {
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownList = document.querySelector(".dropdown-list");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  if (!dropdown || !dropdownList || !arrowClosed || !arrowOpen) return;

  dropdown.classList.remove("active");
  dropdownList.style.display = "none";
  arrowClosed.style.display = "block";
  arrowOpen.style.display = "none";
}

/* =============================== */
/*       Utility Functions         */
/* =============================== */

/**
 * Returns the initials of a full name.
 * @function getInitials
 * @param {string} fullName - The full name.
 * @returns {string} The initials (e.g., "JD").
 */
function getInitials(fullName) {
  if (!fullName) return "??";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Determines the CSS class for the profile color based on the contact.
 * @function getColorClass
 * @param {string} name - The name of the contact.
 * @param {Array<Object>} contacts - Array of all contacts.
 * @returns {string} The corresponding CSS class.
 */
function getColorClass(name, contacts) {
  const contact = contacts.find(c => c.name === name);
  return contact && contact.color
    ? `profile-badge-${contact.color.replace("#", "")}`
    : "profile-badge-default";
}

/**
 * Toggles the state of a contact's checkbox.
 * @function toggleCheckboxState
 * @param {Object} contact - The contact object.
 * @param {HTMLImageElement} checkboxImg - The image element for the checkbox state.
 * @param {HTMLElement} itemElement - The DOM element of the dropdown item.
 */
function toggleCheckboxState(contact, checkboxImg, itemElement) {
  const isSelected = selectedContacts.some(c => c.name === contact.name);

  if (!isSelected) {
    selectedContacts.push(contact);
    checkboxImg.src = "../img/checkboxchecked.png";
    itemElement.classList.add("selected");
  } else {
    selectedContacts = selectedContacts.filter(c => c.name !== contact.name);
    checkboxImg.src = "../img/chekbox.png";
    itemElement.classList.remove("selected");
  }
  updateAssignedToProfile();
}

/**
 * Updates the display of selected contacts in the profile section.
 * @function updateAssignedToProfile
 */
function updateAssignedToProfile() {
  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  if (!assignedContainer) return;
  
  assignedContainer.innerHTML = "";

  selectedContacts.forEach(contact => {
    const initials = getInitials(contact.name);
    const colorClass = getColorClass(contact.name, contactsArray);

    const profileBubble = document.createElement("div");
    profileBubble.classList.add("profile-badge", colorClass);
    profileBubble.textContent = initials;

    assignedContainer.appendChild(profileBubble);
  });
}

/* =============================== */
/*         Form Validation         */
/* =============================== */

/**
 * Validates the form by checking if all required fields are filled.
 * @function validateForm
 * @returns {boolean} True if all fields are filled, otherwise false.
 */
function validateForm() {
  const title = document.querySelector(".input")?.value.trim();
  const dueDate = document.querySelector(".date-input")?.value.trim();
  const category = document.querySelector(".select-task")?.value;
  const assignedUsers = selectedContacts.length > 0;
  const prioritySelected = document.querySelector(".priority-container .active") !== null;
  
  return title && dueDate && category && assignedUsers && prioritySelected;
}

/**
 * Placeholder function for adding a task to Firebase.
 * Implementation should be added as needed.
 * @function addTaskToFirebase
 */
function addTaskToFirebase() {
  // TODO: Implement this function.
}

/* =============================== */
/*         Event Listeners         */
/* =============================== */

/**
 * Initializes all required event listeners for the application.
 * @function initEventListeners
 */
function initEventListeners() {
  // Close the dropdown when clicking outside of it.
  document.addEventListener("click", event => {
    const dropdown = document.querySelector(".custom-dropdown");
    if (dropdown && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  // When DOM is loaded, load contacts and initialize UI elements.
  document.addEventListener("DOMContentLoaded", () => {
    loadContactsFromFirebase();

    const dropdownSearch = document.querySelector(".dropdown-search");
    const arrowClosed = document.querySelector(".search-icon");
    const arrowOpen = document.querySelector(".search-icon-active");

    if (dropdownSearch) dropdownSearch.addEventListener("click", toggleDropdown);
    if (arrowClosed) arrowClosed.addEventListener("click", toggleDropdown);
    if (arrowOpen) arrowOpen.addEventListener("click", toggleDropdown);

    // Form validation and task creation.
    const createBtn = document.querySelector(".create-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        if (validateForm()) {
          addTaskToFirebase();
        }
      });
    }

    // Listen for input changes for validation.
    const inputSelectors = [".input", ".date-input", ".select-task"];
    inputSelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.addEventListener("input", validateForm);
      }
    });

    const priorityContainer = document.querySelector(".priority-container");
    if (priorityContainer) {
      priorityContainer.addEventListener("click", validateForm);
    }

    const assignedContainer = document.querySelector(".assigned-to-profiles-container");
    if (assignedContainer) {
      const observer = new MutationObserver(validateForm);
      observer.observe(assignedContainer, { childList: true });
    }

    // Run initial validation.
    validateForm();
  });
}

/* =============================== */
/*           App Start             */
/* =============================== */

/**
 * Initializes the application.
 * @function initApp
 */
function initApp() {
  initEventListeners();
}

// Start the application.
initApp();
