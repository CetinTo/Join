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
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Chooses a CSS class name based on the provided name.
 *
 * @param {string} name - The name used to calculate a color hash.
 * @param {Object} [contacts] - Optional object, currently unused.
 * @returns {string} The CSS class name.
 */
function getColorClass(name, contacts) {
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
  const contactsSection = document.querySelector(".ContactsSection");
  contactsSection.innerHTML = "";
  let currentLetter = "";
  contactsArray.forEach(([contactId, contact]) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      contactsSection.appendChild(createAlphabeticRow(currentLetter));
    }
    contactsSection.appendChild(createContactElement(contact, contactId, contacts));
  });
}

/**
 * Creates a DOM element for a new alphabetical row.
 *
 * @param {string} letter - The letter to display.
 * @returns {HTMLElement} The DOM element for the alphabetic row.
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
  contactDiv.addEventListener("click", () =>
    displayContactDetails(contact, contactId, contactDiv)
  );
  return contactDiv;
}

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

  const contactsBody = document.querySelector('.Contacts-body');
  if (window.innerWidth < 925) {
    if (contactsBody) contactsBody.style.display = 'none';
  } else {
    if (contactsBody) contactsBody.style.display = 'block';
  }
  document.querySelector('.contacts-main-section').classList.add('contact-selected');

  document.querySelectorAll(".contact-list").forEach(item =>
    item.classList.remove("active-contact")
  );
  selectedElement.classList.add("active-contact");

  detailsSection.innerHTML = `
    <div class="selected-profile-main">
      <div class="profile-badge-big ${getColorClass(contact.name, null)}">${getInitials(contact.name)}</div>
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
    <div class="contact-action-button">
      <span>⋮</span>
    </div>
    <div class="contact-action-popup">
      <div class="contact-action-option edit-action" data-contact-id="${contactId}">
        <img src="../img/edit-contacts.png" alt="edit">
      </div>
      <div class="contact-action-option delete-action" data-contact-id="${contactId}">
        <img src="../img/delete-contacts.png" alt="delete">
      </div>
    </div>
  `;

  const actionButton = detailsSection.querySelector('.contact-action-button');
  const actionPopup = detailsSection.querySelector('.contact-action-popup');

  actionButton.addEventListener('click', function(e) {
    e.stopPropagation();
    actionPopup.classList.toggle('show');
  });

  actionPopup.querySelector('.edit-action').addEventListener('click', async function(e) {
    e.stopPropagation();
    const contactId = this.dataset.contactId;
    const contactData = await fetchContact(contactId);
    if (contactData) openEditModal(contactData, contactId);
    actionPopup.classList.remove('show');
  });

  actionPopup.querySelector('.delete-action').addEventListener('click', async function(e) {
    e.stopPropagation();
    const contactId = this.dataset.contactId;
    await deleteContactFromFirebase(contactId);
    actionPopup.classList.remove('show');
  });

  // Close the popup if clicked outside
  document.addEventListener('click', function closePopupOnClick(event) {
    if (!actionButton.contains(event.target) && !actionPopup.contains(event.target)) {
      actionPopup.classList.remove('show');
    }
  });

  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', cleanupMenus);
  }
}

/**
 * Removes active menus and hides all popup elements.
 */
function cleanupMenus() {
  // Remove click listeners that close popups
  document.removeEventListener('click', function(){});
  const popups = document.querySelectorAll('.contact-action-popup, .contact-options-popup');
  popups.forEach(popup => popup.classList.remove('show'));
}

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
  }
  return null;
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
  
  // Remove any existing badge if present
  const existingBadge = modal.querySelector("#edit-contact-badge");
  if (existingBadge) {
    existingBadge.remove();
  }
  
  // Create and append the new badge
  const badge = document.createElement("div");
  badge.id = "edit-contact-badge";
  badge.className = `profile-badge-big-edit ${getColorClass(contact.name, null)}`;
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

  // Update the badge in the edit modal
  updateEditModalBadge(contact);

  const saveBtn = document.querySelector(".save-btn");
  saveBtn.dataset.contactId = contactId;
  // Remove previous listener to avoid multiple bindings
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
  const contactId = event.target.dataset.contactId;
  if (!contactId) return;

  const modal = document.querySelector(".modal-overlay-edit");
  const updatedContact = {
    name: modal.querySelector("input[placeholder='Name']").value.trim(),
    email: modal.querySelector("input[placeholder='Email']").value.trim(),
    phone: modal.querySelector("input[placeholder='Telefonnummer']").value.trim()
  };

  try {
    const response = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`, {
      method: "PUT",
      body: JSON.stringify(updatedContact),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Error saving: ${response.status} ${response.statusText}`);
    }
    // Reload the contact list
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
  setTimeout(() => modal.style.display = "none", 300);
}

/**
 * Deletes a contact from Firebase and updates the view.
 *
 * @async
 * @param {string} contactId - The unique contact ID.
 */
async function deleteContactFromFirebase(contactId) {
  try {
    const response = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`, { method: "DELETE" });
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
  if (window.innerWidth < 925) {
    const contactsBody = document.querySelector('.Contacts-body');
    if (contactsBody) {
      contactsBody.style.display = 'block';
    }
  }
  document.querySelector('.contacts-main-section').classList.remove('contact-selected');
}

/**
 * Reloads the current page.
 */
function reloadPage() {
  location.reload();
}

// Event delegation for the edit button in the main section
document.addEventListener("click", async (event) => {
  if (event.target.matches(".edit-contact-btn")) {
    const contactId = event.target.dataset.contactId;
    const contact = await fetchContact(contactId);
    if (contact) openEditModal(contact, contactId);
  }
});

// Event delegation for the delete button in the main section
document.addEventListener("click", async (event) => {
  if (event.target.matches(".delete-btn")) {
    const contactId = event.target.dataset.contactId || event.target.closest(".delete-btn").dataset.contactId;
    if (contactId) await deleteContactFromFirebase(contactId);
  }
});

// Event delegation for the delete button in the edit modal
document.addEventListener('click', function(event) {
  if (event.target.matches('.edit-delete-btn-modal') ||
      event.target.closest('.edit-delete-btn-modal')) {
    
    console.log("Delete button in edit modal clicked");
    
    const saveBtn = document.querySelector(".save-btn");
    const contactId = saveBtn.dataset.contactId;
    
    if (contactId) {
      console.log("Deleting contact with ID:", contactId);
      deleteContactFromFirebase(contactId);
      closeModal(".modal-overlay-edit");
    } else {
      console.error("No contact ID found");
    }
  }
});

// Load contacts when the DOM is ready
document.addEventListener("DOMContentLoaded", loadContactsFromFirebase);

// Back button in the responsive header
document.addEventListener('DOMContentLoaded', function() {
  const returnImg = document.querySelector('.contacts_headline-resp img[alt="return button"]');
  if (returnImg) {
    returnImg.addEventListener('click', backToContactList);
  }
});

// Adjust view on window resize
window.addEventListener('resize', function() {
  if (window.innerWidth >= 925) {
    const contactsBody = document.querySelector('.Contacts-body');
    if (contactsBody) {
      contactsBody.style.display = 'block';
    }
    document.querySelector('.contacts-main-section').classList.remove('contact-selected');
  }
});
