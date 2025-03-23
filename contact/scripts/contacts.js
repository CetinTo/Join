/**
 * Returns the initials of a given full name.
 * If the name is empty, returns "--".
 *
 * @param {string} fullName - The full name.
 * @returns {string} The initials in uppercase.
 */
function getInitials(fullName) {
  if (!fullName) return "--";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Chooses a CSS class name based on the provided name.
 *
 * @param {string} name - The name used to calculate a color hash.
 * @returns {string} The CSS class name.
 */
function getColorClass(name) {
  const classes = [
    "profile-badge-orange",
    "profile-badge-purple",
    "profile-badge-blue-violet",
    "profile-badge-pink",
    "profile-badge-yellow",
    "profile-badge-mint",
    "profile-badge-dark-blue",
    "profile-badge-red",
    "profile-badge-light-blue"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return classes[hash % classes.length];
}

/**
 * Loads contacts from Firebase and initiates rendering.
 *
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

    const contactsArray = Object.entries(contacts).sort((a, b) =>
      a[1].name.localeCompare(b[1].name)
    );
    renderContacts(contactsArray, contacts);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Renders the list of contacts grouped by their first letter.
 *
 * @param {Array} contactsArray - Array of [contactId, contact] pairs.
 * @param {Object} contacts - The complete contacts object.
 */
function renderContacts(contactsArray, contacts) {
  const section = document.querySelector(".ContactsSection");
  section.innerHTML = "";
  let currentLetter = "";

  contactsArray.forEach(([contactId, contact]) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      section.appendChild(createAlphabeticRow(currentLetter));
    }
    section.appendChild(createContactElement(contact, contactId, contacts));
  });
}

/**
 * Creates a DOM element for a new alphabetical row.
 *
 * @param {string} letter - The letter to display.
 * @returns {HTMLElement} The DOM element for the row.
 */
function createAlphabeticRow(letter) {
  const row = document.createElement("div");
  row.classList.add("alphabetic-row");
  row.innerHTML = `<h3>${letter}</h3>`;
  return row;
}

/**
 * Creates a DOM element for an individual contact.
 *
 * @param {Object} contact - The contact object.
 * @param {string} contactId - The unique contact ID.
 * @param {Object} contacts - The complete contacts object.
 * @returns {HTMLElement} The DOM element for the contact.
 */
function createContactElement(contact, contactId, contacts) {
  const div = document.createElement("div");
  div.classList.add("contact-list");
  div.dataset.contactId = contactId;
  const initials = getInitials(contact.name);
  const color = getColorClass(contact.name);
  div.innerHTML = `
    <div class="profile-badge-contacts ${color}">${initials}</div>
    <div>
      <div class="contact-list-name">${contact.name}</div>
      <div class="contact-list-email">${contact.email}</div>
    </div>
  `;
  div.addEventListener("click", () => displayContactDetails(contact, contactId, div));
  return div;
}

/* --------------------- DISPLAY DETAILS --------------------- */

/**
 * Displays the detailed view of a contact.
 *
 * @param {Object} contact - The contact object.
 * @param {string} contactId - The unique contact ID.
 * @param {HTMLElement} selectedElement - The selected DOM element.
 */
function displayContactDetails(contact, contactId, selectedElement) {
  const detailsSection = document.querySelector(".contact-details");
  if (!detailsSection) return;

  cleanupMenus();
  setContactsBodyDisplay();
  updateActiveContact(selectedElement);
  detailsSection.innerHTML = buildContactDetailsHTML(contact, contactId);
  setupPopupActions(detailsSection);

  const backBtn = document.querySelector('.back-button');
  if (backBtn) {
    backBtn.addEventListener('click', cleanupMenus);
  }
}

/**
 * Removes active menus and hides all popup elements.
 */
function cleanupMenus() {
  document.removeEventListener('click', function(){});
  const popups = document.querySelectorAll('.contact-action-popup, .contact-options-popup');
  popups.forEach(popup => popup.classList.remove('show'));
}

/**
 * Sets the visibility of the Contacts body based on window width.
 */
function setContactsBodyDisplay() {
  const body = document.querySelector('.Contacts-body');
  if (!body) return;
  body.style.display = window.innerWidth < 925 ? 'none' : 'block';
  document.querySelector('.contacts-main-section').classList.add('contact-selected');
}

/**
 * Updates the UI state for contact selection.
 *
 * @param {HTMLElement} selectedElement - The element of the selected contact.
 */
function updateActiveContact(selectedElement) {
  document.querySelectorAll(".contact-list").forEach(item =>
    item.classList.remove("active-contact")
  );
  selectedElement.classList.add("active-contact");
}

/**
 * Builds the HTML for the contact details section.
 *
 * @param {Object} contact - The contact object.
 * @param {string} contactId - The unique contact ID.
 * @returns {string} The HTML string.
 */
function buildContactDetailsHTML(contact, contactId) {
  return `
    <div class="selected-profile-main">
      <div class="profile-badge-big ${getColorClass(contact.name)}">
        ${getInitials(contact.name)}
      </div>
      <div>
        <div class="profile-name-big">${contact.name}</div>
        <div class="edit-delete-img-div">
          <img src="../img/edit-contacts.png" alt="edit" class="edit-contact-btn" data-contact-id="${contactId}">
          <img src="../img/delete-contacts.png" alt="delete" class="delete-btn" data-contact-id="${contactId}">
        </div>
      </div>
    </div>
    <div class="contact-information-text">Contact Information</div>
    <div class="contact-info-container">
      <div><h4>Email</h4></div>
      <div class="contact-list-email">${contact.email || "Not available"}</div>
      <div><h4>Phone</h4></div>
      <div class="contact-list-phone">${contact.phone || "Not available"}</div>
    </div>
    <div class="contact-action-button"><span>⋮</span></div>
    <div class="contact-action-popup">
      <div class="contact-action-option edit-action" data-contact-id="${contactId}">
        <img src="../img/edit-contacts.png" alt="edit">
      </div>
      <div class="contact-action-option delete-action" data-contact-id="${contactId}">
        <img src="../img/delete-contacts.png" alt="delete">
      </div>
    </div>
  `;
}

/* --------------------- POPUP ACTIONS --------------------- */

/**
 * Sets up the event listeners for the action popup.
 *
 * @param {HTMLElement} detailsSection - The contact details container.
 */
function setupPopupActions(detailsSection) {
  const actionButton = detailsSection.querySelector('.contact-action-button');
  const actionPopup = detailsSection.querySelector('.contact-action-popup');

  actionButton.addEventListener('click', e => {
    e.stopPropagation();
    actionPopup.classList.toggle('show');
  });
  setupEditDeleteListeners(actionPopup);
  setupDocumentClickListener(actionButton, actionPopup);
}

/**
 * Attaches event listeners for the edit and delete actions.
 *
 * @param {HTMLElement} actionPopup - The popup container.
 */
function setupEditDeleteListeners(actionPopup) {
  const editBtn = actionPopup.querySelector('.edit-action');
  const deleteBtn = actionPopup.querySelector('.delete-action');

  editBtn.addEventListener('click', async function(e) {
    e.stopPropagation();
    const contactId = this.dataset.contactId;
    const contactData = await fetchContact(contactId);
    if (contactData) openEditModal(contactData, contactId);
    actionPopup.classList.remove('show');
  });

  deleteBtn.addEventListener('click', async function(e) {
    e.stopPropagation();
    await deleteContactFromFirebase(this.dataset.contactId);
    actionPopup.classList.remove('show');
  });
}

/**
 * Closes the popup if clicked outside.
 *
 * @param {HTMLElement} actionButton - The button that toggles the popup.
 * @param {HTMLElement} actionPopup - The popup container.
 */
function setupDocumentClickListener(actionButton, actionPopup) {
  document.addEventListener('click', function closePopup(e) {
    if (!actionButton.contains(e.target) && !actionPopup.contains(e.target)) {
      actionPopup.classList.remove('show');
    }
  });
}

/* --------------------- FIREBASE & EDIT --------------------- */

/**
 * Fetches a single contact from Firebase.
 *
 * @async
 * @param {string} contactId - The unique contact ID.
 * @returns {Promise<Object|null>} The contact object or null on error.
 */
async function fetchContact(contactId) {
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error loading: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Updates the profile badge in the edit modal.
 *
 * @param {Object} contact - The contact object.
 */
function updateEditModalBadge(contact) {
  const modal = document.querySelector(".modal-overlay-edit");
  const badgeContainer = modal.querySelector(".profile-img-circle");
  if (!badgeContainer) return;

  const existing = modal.querySelector("#edit-contact-badge");
  if (existing) existing.remove();

  const badge = document.createElement("div");
  badge.id = "edit-contact-badge";
  badge.className = `profile-badge-big-edit ${getColorClass(contact.name)}`;
  badge.textContent = getInitials(contact.name);
  badgeContainer.appendChild(badge);
}

/**
 * Opens the edit modal and fills the fields with contact data.
 *
 * @param {Object} contact - The contact object.
 * @param {string} contactId - The unique contact ID.
 */
function openEditModal(contact, contactId) {
  const modal = document.querySelector(".modal-overlay-edit");
  modal.style.display = "flex";
  modal.classList.add("show-modal");

  modal.querySelector("input[placeholder='Name']").value = contact.name || "";
  modal.querySelector("input[placeholder='Email']").value = contact.email || "";
  modal.querySelector("input[placeholder='Telefonnummer']").value = contact.phone || "";
  updateEditModalBadge(contact);

  const saveBtn = document.querySelector(".save-btn");
  saveBtn.dataset.contactId = contactId;
  saveBtn.removeEventListener("click", saveEditedContact);
  saveBtn.addEventListener("click", saveEditedContact);
}

/**
 * Saves the edited contact to Firebase and updates the view.
 *
 * @async
 * @param {Event} event - The click event of the save button.
 */
async function saveEditedContact(event) {
  const id = event.target.dataset.contactId;
  if (!id) return;

  const modal = document.querySelector(".modal-overlay-edit");
  const updated = {
    name: modal.querySelector("input[placeholder='Name']").value.trim(),
    email: modal.querySelector("input[placeholder='Email']").value.trim(),
    phone: modal.querySelector("input[placeholder='Telefonnummer']").value.trim()
  };

  try {
    const response = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${id}.json`, {
      method: "PUT",
      body: JSON.stringify(updated),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Error saving: ${response.status} ${response.statusText}`);
    }
    await loadContactsFromFirebase();
    closeModal(".modal-overlay-edit");
    reloadPage();
  } catch (error) {
    alert("Error saving. Please try again.");
  }
}

/**
 * Closes the modal specified by the selector.
 *
 * @param {string} selector - The CSS selector for the modal.
 */
function closeModal(selector) {
  const modal = document.querySelector(selector);
  modal.classList.remove("show-modal");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

/**
 * Deletes a contact from Firebase and updates the view.
 *
 * @async
 * @param {string} contactId - The unique contact ID.
 */
async function deleteContactFromFirebase(contactId) {
  try {
    const response = await fetch(
      `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error(`Error deleting: ${response.status} ${response.statusText}`);
    }
    loadContactsFromFirebase();
    document.querySelector(".contact-details").innerHTML = "";
  } catch (error) {
    alert("Error deleting. Please try again.");
  }
}

/**
 * Shows the contact list again when the window is narrow.
 */
function backToContactList() {
  const body = document.querySelector('.Contacts-body');
  if (window.innerWidth < 925 && body) {
    body.style.display = 'block';
  }
  document.querySelector('.contacts-main-section').classList.remove('contact-selected');
}

/**
 * Reloads the current page.
 */
function reloadPage() {
  location.reload();
}

/* --------------------- EVENT LISTENERS --------------------- */

document.addEventListener("click", async (event) => {
  if (event.target.matches(".edit-contact-btn")) {
    const id = event.target.dataset.contactId;
    const contact = await fetchContact(id);
    if (contact) openEditModal(contact, id);
  }
});

document.addEventListener("click", async (event) => {
  if (event.target.matches(".delete-btn")) {
    const id = event.target.dataset.contactId ||
      event.target.closest(".delete-btn").dataset.contactId;
    if (id) await deleteContactFromFirebase(id);
  }
});

document.addEventListener("click", function(event) {
  if (
    event.target.matches('.edit-delete-btn-modal') ||
    event.target.closest('.edit-delete-btn-modal')
  ) {
    const saveBtn = document.querySelector(".save-btn");
    const id = saveBtn.dataset.contactId;
    if (id) {
      deleteContactFromFirebase(id);
      closeModal(".modal-overlay-edit");
    }
  }
});

document.addEventListener("DOMContentLoaded", loadContactsFromFirebase);

document.addEventListener('DOMContentLoaded', function() {
  const backImg = document.querySelector('.contacts_headline-resp img[alt="return button"]');
  if (backImg) {
    backImg.addEventListener('click', backToContactList);
  }
});

window.addEventListener('resize', function() {
  if (window.innerWidth >= 925) {
    const body = document.querySelector('.Contacts-body');
    if (body) body.style.display = 'block';
    document.querySelector('.contacts-main-section').classList.remove('contact-selected');
  }
});
