document.addEventListener("DOMContentLoaded", initAddModalInteractions);

/**
 * Initializes modal interactions and event listeners for adding a contact.
 */
function initAddModalInteractions() {
  const createBtn = document.querySelector(".create-btn");
  const openBtn = document.querySelector(".Contact-button");
  const modal = document.querySelector(".modal-overlay");
  const closeBtn = document.querySelector(".close-modal-button");
  const clearBtn = document.querySelector(".clear-btn");

  openBtn.addEventListener("click", openAddModal);
  closeBtn.addEventListener("click", closeAddModal);
  clearBtn.addEventListener("click", closeAddModal);
  modal.addEventListener("click", handleAddModalOverlayClick);

  createBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const { name, email, phone } = getContactFormValues();
    if (!validateContactInputs(name, email, phone)) return;
    const success = await saveContactToFirebase();
    if (success) closeAddModal();
  });
}

/**
 * Opens the contact modal for adding a new contact.
 */
function openAddModal() {
  const modal = document.querySelector(".modal-overlay");
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show-modal");
  }, 10);
}

/**
 * Closes the contact modal for adding a new contact.
 */
function closeAddModal() {
  const modal = document.querySelector(".modal-overlay");
  modal.classList.remove("show-modal");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

/**
 * Closes the add-contact modal if the overlay is clicked.
 * @param {MouseEvent} e - The click event.
 */
function handleAddModalOverlayClick(e) {
  const modal = document.querySelector(".modal-overlay");
  if (e.target === modal) {
    closeAddModal();
  }
}

/**
 * Generates a profile badge class based on the user's name.
 * @param {string} name - The name to hash.
 * @returns {string} The corresponding badge class.
 */
function getColorClass(name) {
  const classes = [
    "profile-badge-orange", "profile-badge-purple", "profile-badge-blue-violet",
    "profile-badge-pink", "profile-badge-yellow", "profile-badge-mint",
    "profile-badge-dark-blue", "profile-badge-red", "profile-badge-light-blue",
    "profile-badge-orange"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return classes[hash % classes.length];
}

/**
 * Displays a success popup after a new contact is created.
 */
function showSuccessPopup() {
  const popup = document.createElement("div");
  popup.classList.add("success-popup");
  popup.innerHTML = `
    <img src="../img/contactsuccesfullycreated.png" alt="Success" style="width: 100%;">
  `;
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("slide-in"), 50);
  setTimeout(() => {
    popup.classList.remove("slide-in");
    popup.classList.add("slide-out");
    setTimeout(() => popup.remove(), 500);
  }, 2000);
}

/**
 * Saves a new contact to Firebase and updates the contact list.
 * @returns {Promise<boolean>} True if the save was successful, false otherwise.
 */
async function saveContactToFirebase() {
  const { name, email, phone } = getContactFormValues();
  // Die Validierung erfolgt in validateContactInputs
  try {
    await postContactToFirebase({ name, email, phone });
    showSuccessPopup();
    clearContactInputs();
    loadContactsFromFirebase();
    return true;
  } catch (error) {
    console.error("Fehler beim Speichern des Kontakts.", error);
    return false;
  }
}

/**
 * Reads and trims contact form inputs.
 * @returns {{ name: string, email: string, phone: string }} The input values.
 */
function getContactFormValues() {
  const name = document.querySelector("input[placeholder='Name']").value.trim();
  const email = document.querySelector("input[placeholder='Email']").value.trim();
  const phone = document.querySelector("input[placeholder='Telefonnummer']").value.trim();
  return { name, email, phone };
}

/**
 * Validates the contact form inputs.
 * Zusätzlich zur Prüfung, dass alle Felder ausgefüllt sind, wird hier
 * geprüft, ob die E-Mail wirklich dem Format entspricht.
 * @param {string} name - Contact name.
 * @param {string} email - Contact email.
 * @param {string} phone - Contact phone.
 * @returns {boolean} Whether the inputs are valid.
 */
function validateContactInputs(name, email, phone) {
  if (!name || !email || !phone) {
    console.log("Fehler: Alle Felder müssen ausgefüllt sein.");
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Fehler: Bitte eine gültige E-Mail-Adresse eingeben.");
    return false;
  }
  
  // Telefon: Nur Ziffern, mind. 6 Zeichen
  const phoneRegex = /^[0-9]{6,}$/;
  if (!phoneRegex.test(phone)) {
    console.log("Fehler: Bitte nur gültige Telefonnummern eingeben (mind. 6 Ziffern).");
    return false;
  }
  
  return true;
}



/**
 * Sends a new contact to Firebase (HTTP POST request).
 * @param {Object} contact - The new contact data.
 * @returns {Promise<void>}
 */
async function postContactToFirebase(contact) {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(contact),
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Fehler : ${response.status} ${response.statusText}`);
  }
}

/**
 * Clears the contact input fields in the Add-Modal.
 */
function clearContactInputs() {
  document.querySelector("input[placeholder='Name']").value = "";
  document.querySelector("input[placeholder='Email']").value = "";
  document.querySelector("input[placeholder='Telefonnummer']").value = "";
}

/* ---------------------- EDIT MODAL ---------------------- */

document.addEventListener("DOMContentLoaded", initEditModal);

/**
 * Initializes event listeners for the edit contact modal.
 */
function initEditModal() {
  const modal = document.querySelector(".modal-overlay-edit");
  const closeBtn = document.querySelector(".close-modal-button-edit");

  closeBtn?.addEventListener("click", closeEditModal);

  modal?.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeEditModal();
    }
  });
}

/**
 * Closes the edit contact modal with fade-out animation.
 */
function closeEditModal() {
  const modal = document.querySelector(".modal-overlay-edit");
  if (!modal) return;
  modal.classList.remove("show-modal");
  modal.classList.add("hide-modal");
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("hide-modal");
  }, 300);
}