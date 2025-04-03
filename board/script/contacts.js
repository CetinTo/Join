/**
 * @fileOverview Main file for contact management, dropdown interactions, and form validation.
 */

import { createDropdownItem } from './template.js';

/* =============================== */
/*         Global Variables        */
/* =============================== */

/**
 * List of selected contacts.
 * @type {Array<Object>}
 */
let selectedContacts = [];

/**
 * All contacts fetched from Firebase.
 * @type {Array<Object>}
 */
let contactsArray = [];

/* =============================== */
/*         Data Loading            */
/* =============================== */

/**
 * Fetches contacts from Firebase and initializes dropdown and search.
 * @async
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
 * Initializes the dropdown list with contact entries.
 */
function initDropdownList() {
  const dropdownList = document.querySelector(".dropdown-list");
  const searchInput = document.querySelector(".dropdown-search");
  if (!dropdownList || !searchInput) return;

  dropdownList.innerHTML = "";
  searchInput.value = "";

  contactsArray.forEach(contact => {
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
 * Adds input search functionality to the dropdown list.
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
 * Toggles the dropdown open or closed.
 * @param {Event} event - The triggering event.
 */
function toggleDropdown(event) {
  const dropdown = document.querySelector(".custom-dropdown");
  if (!dropdown) return;

  if (event?.stopPropagation) {
    event.stopPropagation();
  }

  if (!event || !dropdown.contains(event.target)) {
    closeDropdown();
    return;
  }

  dropdown.classList.contains("active") ? closeDropdown() : openDropdown();
}

/**
 * Opens the dropdown and adjusts the UI.
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
 * Closes the dropdown and resets arrow indicators.
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
 * Extracts initials from a full name.
 * @param {string} fullName - The full name of a contact.
 * @returns {string} The initials.
 */
function getInitials(fullName) {
  if (!fullName) return "??";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Returns the CSS class based on a contact's color property.
 * @param {string} name - Contact name.
 * @param {Array<Object>} contacts - List of all contacts.
 * @returns {string} The CSS class name.
 */
function getColorClass(name, contacts) {
  const contact = contacts.find(c => c.name === name);
  return contact && contact.color
    ? `profile-badge-${contact.color.replace("#", "")}`
    : "profile-badge-default";
}

/**
 * Toggles a checkbox and updates selectedContacts.
 * @param {Object} contact - The contact object.
 * @param {HTMLImageElement} checkboxImg - The image element used for the checkbox.
 * @param {HTMLElement} itemElement - The dropdown item container.
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
 * Updates the UI to reflect selected contacts in the profile section.
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
 * Validates the task form inputs.
 * @returns {boolean} True if all required fields are valid.
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
 * Placeholder function to handle saving tasks.
 */
function addTaskToFirebase() {
  // TODO: Implement this function.
}

/* =============================== */
/*         Event Listeners         */
/* =============================== */

/**
 * Sets up a listener to close the dropdown when außerhalb geklickt wird.
 */
function setupOutsideClickListener() {
  document.addEventListener("click", event => {
    const dropdown = document.querySelector(".custom-dropdown");
    if (dropdown && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  });
}

/**
 * Sets up all dropdown-related event listeners.
 */
function setupDropdownListeners() {
  const dropdownSearch = document.querySelector(".dropdown-search");
  const arrowClosed = document.querySelector(".search-icon");
  const arrowOpen = document.querySelector(".search-icon-active");

  dropdownSearch?.addEventListener("click", toggleDropdown);
  arrowClosed?.addEventListener("click", toggleDropdown);
  arrowOpen?.addEventListener("click", toggleDropdown);
}

/**
 * Sets up event listeners for Form-Validierung und Task-Erstellung.
 */
function setupFormListeners() {
  // Task erstellen
  const createBtn = document.querySelector(".create-btn");
  createBtn?.addEventListener("click", () => {
    if (validateForm()) {
      addTaskToFirebase();
    }
  });

  // Eingabefelder
  const inputSelectors = [".input", ".date-input", ".select-task"];
  inputSelectors.forEach(selector => {
    document.querySelector(selector)?.addEventListener("input", validateForm);
  });

  // Priority Container
  const priorityContainer = document.querySelector(".priority-container");
  priorityContainer?.addEventListener("click", validateForm);

  // Beobachten des assigned profiles Containers
  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  if (assignedContainer) {
    const observer = new MutationObserver(validateForm);
    observer.observe(assignedContainer, { childList: true });
  }
}

/**
 * Initialisiert alle Event Listener, wenn das DOM vollständig geladen ist.
 */
function setupDOMContentLoadedListeners() {
  loadContactsFromFirebase();
  setupDropdownListeners();
  setupFormListeners();
  validateForm();
}

/**
 * Initialisiert alle relevanten Event Listener.
 */
function initEventListeners() {
  setupOutsideClickListener();
  document.addEventListener("DOMContentLoaded", setupDOMContentLoadedListeners);
}

// Anwendung starten
function initApp() {
  initEventListeners();
}

initApp();




