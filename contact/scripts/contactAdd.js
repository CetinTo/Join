document.addEventListener("DOMContentLoaded", initModalInteractions);

/**
 * Initializes modal interactions and event listeners on page load.
 */
function initModalInteractions() {
  const createContactBtn = document.querySelector(".create-btn");
  const openModalBtn = document.querySelector(".Contact-button");
  const modalOverlay = document.querySelector(".modal-overlay");
  const closeBtn = document.querySelector(".close-modal-button");
  const clearBtn = document.querySelector(".clear-btn");

  openModalBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  clearBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", handleOverlayClick);

  createContactBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    console.log("createContactBtn clicked");
    const success = await saveContactToFirebase();
    if (success) closeModal();
  });
}

/**
 * Opens the contact modal.
 */
function openModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.style.display = "flex";
  setTimeout(() => {
    modalOverlay.classList.add("show-modal");
  }, 10);
}

/**
 * Closes the contact modal.
 */
function closeModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.classList.remove("show-modal");
  setTimeout(() => {
    modalOverlay.style.display = "none";
  }, 300);
}

/**
 * Handles clicks outside the modal to close it.
 * @param {MouseEvent} event - The click event.
 */
function handleOverlayClick(event) {
  const modalOverlay = document.querySelector(".modal-overlay");
  if (event.target === modalOverlay) {
    closeModal();
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
 * Displays a success popup after contact is created.
 */
function showSuccessPopup() {
  const successPopup = document.createElement("div");
  successPopup.classList.add("success-popup");
  successPopup.innerHTML = `<img src="../img/contactsuccesfullycreated.png" alt="Success" style="width: 100%;">`;
  document.body.appendChild(successPopup);

  setTimeout(() => successPopup.classList.add("slide-in"), 50);
  setTimeout(() => {
    successPopup.classList.remove("slide-in");
    successPopup.classList.add("slide-out");
    setTimeout(() => successPopup.remove(), 500);
  }, 2000);
}

/**
 * Saves a new contact to Firebase and clears input fields on success.
 * @returns {Promise<boolean>} True if successful, otherwise false.
 */
async function saveContactToFirebase() {
  const name = document.querySelector("input[placeholder='Name']").value.trim();
  const email = document.querySelector("input[placeholder='Email']").value.trim();
  const phone = document.querySelector("input[placeholder='Telefonnummer']").value.trim();

  if (!name || !email || !phone) {
    alert("Fehler: Alle Felder müssen ausgefüllt sein.");
    return false;
  }

  const newContact = { name, email, phone };
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(newContact),
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Fehler : ${response.status} ${response.statusText}`);
    }

    showSuccessPopup();
    clearContactInputs();
    loadContactsFromFirebase();
    return true;
  } catch (error) {
    alert("Fehler beim Speichern des Kontakts.");
    return false;
  }
}

/**
 * Clears the contact input fields.
 */
function clearContactInputs() {
  document.querySelector("input[placeholder='Name']").value = "";
  document.querySelector("input[placeholder='Email']").value = "";
  document.querySelector("input[placeholder='Telefonnummer']").value = "";
}

// EDIT MODAL
document.addEventListener("DOMContentLoaded", initEditModal);

/**
 * Initializes event listeners for the edit contact modal.
 */
function initEditModal() {
  const modalOverlayEdit = document.querySelector(".modal-overlay-edit");
  const closeEditModalBtn = document.querySelector(".close-modal-button-edit");

  closeEditModalBtn.addEventListener("click", closeEditModal);
  modalOverlayEdit.addEventListener("click", function (event) {
    if (event.target === modalOverlayEdit) {
      closeEditModal();
    }
  });
}

/**
 * Closes the edit contact modal with animation.
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
