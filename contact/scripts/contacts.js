function getInitials(fullName) {
  if (!fullName) return "--";
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

function getColorClass(name, contacts) {
  const contact = contacts ? Object.values(contacts).find(c => c.name === name) : null;
  return contact ? `profile-badge-${contact.color.slice(1)}` : 'profile-badge-default';
}

async function loadContactsFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status} ${response.statusText}`);
    const contacts = await response.json();
    if (!contacts) return;
    const contactsArray = Object.entries(contacts).sort((a, b) => a[1].name.localeCompare(b[1].name));
    renderContacts(contactsArray, contacts);
  } catch (error) {
  }
}

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

function createAlphabeticRow(letter) {
  const row = document.createElement("div");
  row.classList.add("alphabetic-row");
  row.innerHTML = `<h3>${letter}</h3>`;
  return row;
}

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

function displayContactDetails(contact, contactId, selectedElement) {
  const detailsSection = document.querySelector(".contact-details");
  if (!detailsSection) return;
  cleanupMenus();
  const contactsBody = document.querySelector('.Contacts-body');
  if (window.innerWidth < 925) {
    if (contactsBody) {
      contactsBody.style.display = 'none';
    }
  } else {
    if (contactsBody) {
      contactsBody.style.display = 'block';
    }
  }
  document.querySelector('.contacts-main-section').classList.add('contact-selected');
  document.querySelectorAll(".contact-list").forEach(item => item.classList.remove("active-contact"));
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
      <div class="contact-list-email">${contact.email || "Nicht verfügbar"}</div>
      <div><h4>Phone</h4></div>
      <div class="contact-list-phone">${contact.phone || "Nicht verfügbar"}</div>
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
    const contact = await fetchContact(contactId);
    if (contact) openEditModal(contact, contactId);
    actionPopup.classList.remove('show');
  });
  actionPopup.querySelector('.delete-action').addEventListener('click', async function(e) {
    e.stopPropagation();
    const contactId = this.dataset.contactId;
    await deleteContactFromFirebase(contactId);
    actionPopup.classList.remove('show');
  });
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

function cleanupMenus() {
  document.removeEventListener('click', function(){});
  const popups = document.querySelectorAll('.contact-action-popup, .contact-options-popup');
  popups.forEach(popup => {
    popup.classList.remove('show');
  });
}

document.addEventListener("click", async (event) => {
  if (event.target.matches(".edit-contact-btn")) {
    const contactId = event.target.dataset.contactId;
    const contact = await fetchContact(contactId);
    if (contact) openEditModal(contact, contactId);
  }
});

async function fetchContact(contactId) {
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
  }
}

function openEditModal(contact, contactId) {
  const modal = document.querySelector(".modal-overlay-edit");
  modal.style.display = "flex";
  modal.classList.add("show-modal");
  modal.querySelector("input[placeholder='Name']").value = contact.name || "";
  modal.querySelector("input[placeholder='Email']").value = contact.email || "";
  modal.querySelector("input[placeholder='Telefonnummer']").value = contact.phone || "";
  const profileImgCircle = modal.querySelector(".profile-img-circle");
  const initials = getInitials(contact.name);
  const color = contact.color || '#ccc';
  profileImgCircle.innerHTML = `<span>${initials}</span>`;
  profileImgCircle.style.backgroundColor = color;
  profileImgCircle.style.color = '#fff';
  const saveBtn = document.querySelector(".save-btn");
  saveBtn.dataset.contactId = contactId;
  saveBtn.removeEventListener("click", saveEditedContact);
  saveBtn.addEventListener("click", saveEditedContact);
}

async function saveEditedContact(event) {
  const contactId = event.target.dataset.contactId;
  if (!contactId) return;
  const updatedContact = {
    name: document.querySelector(".modal-overlay-edit input[placeholder='Name']").value.trim(),
    email: document.querySelector(".modal-overlay-edit input[placeholder='Email']").value.trim(),
    phone: document.querySelector(".modal-overlay-edit input[placeholder='Telefonnummer']").value.trim()
  };
  try {
    const response = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`, {
      method: "PUT",
      body: JSON.stringify(updatedContact),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error(`Fehler beim Speichern: ${response.status} ${response.statusText}`);
    loadContactsFromFirebase();
    closeModal(".modal-overlay-edit");
  } catch (error) {
    alert("Fehler beim Speichern. Bitte erneut versuchen.");
  }
}

function closeModal(selector) {
  const modal = document.querySelector(selector);
  modal.classList.remove("show-modal");
  setTimeout(() => modal.style.display = "none", 300);
}

document.addEventListener("click", async (event) => {
  if (event.target.matches(".delete-btn")) {
    const contactId = event.target.dataset.contactId || event.target.closest(".delete-btn").dataset.contactId;
    if (contactId) await deleteContactFromFirebase(contactId);
  }
});

async function deleteContactFromFirebase(contactId) {
  try {
    const response = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts/${contactId}.json`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Fehler beim Löschen: ${response.status} ${response.statusText}`);
    loadContactsFromFirebase();
    document.querySelector(".contact-details").innerHTML = "";
  } catch (error) {
    alert("Fehler beim Löschen. Bitte erneut versuchen.");
  }
}

document.addEventListener("DOMContentLoaded", loadContactsFromFirebase);

function showContactDetails(contactId) {
  const contact = contacts[contactId];
  if (!contact) return;
  document.querySelector('.edit-contact-btn').addEventListener('click', function() {
    openEditModal(contact, contactId);
  });
}

function backToContactList() {
  if (window.innerWidth < 925) {
    const contactsBody = document.querySelector('.Contacts-body');
    if (contactsBody) {
      contactsBody.style.display = 'block';
    }
  }
  document.querySelector('.contacts-main-section').classList.remove('contact-selected');
}

document.addEventListener('DOMContentLoaded', function() {
  const returnImg = document.querySelector('.contacts_headline-resp img[alt="return button"]');
  if (returnImg) {
    returnImg.addEventListener('click', backToContactList);
  }
});

window.addEventListener('resize', function() {
  if (window.innerWidth >= 925) {
    const contactsBody = document.querySelector('.Contacts-body');
    if (contactsBody) {
      contactsBody.style.display = 'block';
    }
    document.querySelector('.contacts-main-section').classList.remove('contact-selected');
  }
});
