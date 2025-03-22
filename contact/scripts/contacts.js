/**
 * Returns the initials from a full name.
 * @param {string} fullName - The full name of the contact.
 * @returns {string} The uppercase initials.
 */
function getInitials(fullName) {
  if (!fullName) return "--";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Generates a consistent badge color class based on contact name.
 * @param {string} name - The contact name.
 * @param {Object|null} contacts - The full contacts object (unused).
 * @returns {string} The color class name.
 */
function getColorClass(name, contacts) {
  const classes = [
    "profile-badge-orange", "profile-badge-purple", "profile-badge-blue-violet",
    "profile-badge-pink", "profile-badge-yellow", "profile-badge-mint",
    "profile-badge-dark-blue", "profile-badge-red", "profile-badge-light-blue"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return classes[hash % classes.length];
}

/**
 * Loads all contacts from Firebase and renders them.
 */
async function loadContactsFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    const contacts = await response.json();
    if (!contacts) return;
    const contactsArray = Object.entries(contacts).sort((a, b) => a[1].name.localeCompare(b[1].name));
    renderContacts(contactsArray, contacts);
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Renders the full contact list, grouped by first letter.
 * @param {Array} contactsArray - Array of [id, contact] pairs.
 * @param {Object} contacts - Raw contacts object from Firebase.
 */
function renderContacts(contactsArray, contacts) {
  const section = document.querySelector(".ContactsSection");
  if (!section) {
    console.warn(".ContactsSection not found in DOM.");
    return;
  }
  section.innerHTML = "";
  let currentLetter = "";
  contactsArray.forEach(([id, contact]) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      section.appendChild(createAlphabeticRow(currentLetter));
    }
    section.appendChild(createContactElement(contact, id, contacts));
  });
}

/**
 * Creates an alphabet row divider.
 * @param {string} letter - The current first letter.
 * @returns {HTMLElement} The row element.
 */
function createAlphabeticRow(letter) {
  const row = document.createElement("div");
  row.classList.add("alphabetic-row");
  row.innerHTML = `<h3>${letter}</h3>`;
  return row;
}

/**
 * Creates a contact list element.
 * @param {Object} contact - Contact data.
 * @param {string} contactId - Firebase ID.
 * @param {Object} contacts - All contacts.
 * @returns {HTMLElement} The contact DOM element.
 */
function createContactElement(contact, contactId, contacts) {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact-list");
  contactDiv.dataset.contactId = contactId;
  const initials = getInitials(contact.name);
  const colorClass = getColorClass(contact.name, contacts);
  contactDiv.innerHTML = `
    <div class="profile-badge-contacts ${colorClass}">${initials}</div>
    <div>
      <div class="contact-list-name">${contact.name}</div>
      <div class="contact-list-email">${contact.email}</div>
    </div>
  `;
  contactDiv.addEventListener("click", () => displayContactDetails(contact, contactId, contactDiv));
  return contactDiv;
}

// Ensure the contacts are loaded after the DOM is fully available
document.addEventListener("DOMContentLoaded", () => {
  loadContactsFromFirebase();
});