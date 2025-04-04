// Prüfen, ob Variable bereits existiert
if (typeof window.contactFormInitialized === 'undefined') {
    window.contactFormInitialized = false;

    /**
     * Initialisiert die Event-Listener für das Kontaktformular
     */
    document.addEventListener("DOMContentLoaded", function() {
        // Nur einmal initialisieren
        if (!window.contactFormInitialized) {
            console.log("Initialisiere Event-Listener...");
            initContactForm();
            initEditModal();
            window.contactFormInitialized = true;
        }
    });

    // Entferne den zweiten DOMContentLoaded Event-Listener
    // document.addEventListener("DOMContentLoaded", initEditModal);

    function initContactForm() {
        // Entferne alle bestehenden Event-Listeners
        removeAllEventListeners();
        
        const openBtn = document.querySelector(".Contact-button");
        const modal = document.querySelector(".modal-overlay");
        const closeBtn = document.querySelector(".close-modal-button");
        const clearBtn = document.querySelector(".clear-btn");
        const createBtn = document.querySelector(".create-contact-btn");

        if (openBtn) {
            console.log("Füge Event-Listener für Open-Button hinzu");
            openBtn.addEventListener("click", openAddModal);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeAddModal);
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", clearForm);
        }

        if (modal) {
            modal.addEventListener("click", handleAddModalOverlayClick);
        }

        if (createBtn) {
            console.log("Füge Event-Listener für Create-Button hinzu");
            // Nur einen Event-Listener für den Create-Button
            createBtn.addEventListener("click", handleCreateButtonClick);
        }
    }

    /**
     * Entfernt alle bestehenden Event-Listeners
     */
    function removeAllEventListeners() {
        const createBtn = document.querySelector(".create-contact-btn");
        if (createBtn) {
            // Klonen und ersetzen des Elements, um alle Event-Listeners zu entfernen
            const newCreateBtn = createBtn.cloneNode(true);
            createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
        }
    }

    /**
     * Handler für den Create-Button
     */
    async function handleCreateButtonClick(e) {
        console.log("Create-Button wurde geklickt");
        e.preventDefault();
        
        // Verhindere mehrfaches Klicken
        this.disabled = true;
        
        if (!validateContactForm()) {
            this.disabled = false;
            return;
        }
        
        try {
            await createContact();
            closeAddModal();
        } catch (error) {
            console.error("Fehler beim Erstellen des Kontakts:", error);
        } finally {
            this.disabled = false;
        }
    }

    /**
     * Öffnet das Modal zum Hinzufügen eines Kontakts
     */
    function openAddContactModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Schließt das Modal zum Hinzufügen eines Kontakts
     */
    function closeAddContactModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.style.display = 'none';
            clearForm();
        }
    }

    /**
     * Leert alle Formularfelder und entfernt Fehlermeldungen
     */
    function clearForm() {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        
        clearErrorMessages();
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
      if (!validateContactInputs(name, email, phone)) return false;

      try {
        await postContactToFirebase({ name, email, phone });
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
     * @param {string} name - Contact name.
     * @param {string} email - Contact email.
     * @param {string} phone - Contact phone.
     * @returns {boolean} Whether the inputs are valid.
     */
    function validateContactInputs(name, email, phone) {
      if (!name || !email || !phone) {
        alert("Fehler: Alle Felder müssen ausgefüllt sein.");
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
      clearForm();
    }

    /**
     * Closes the add-contact modal if the overlay is clicked.
     */
    function handleAddModalOverlayClick(e) {
      const modal = document.querySelector(".modal-overlay");
      if (e.target === modal) {
        closeAddModal();
      }
    }

    /**
     * Validiert das Kontaktformular
     */
    function validateContactForm() {
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        
        clearErrorMessages();
        
        let isValid = true;
        
        // Name validieren (darf nicht leer sein)
        if (!nameInput.value.trim()) {
            displayErrorMessage(nameInput, 'Bitte geben Sie einen Namen ein');
            isValid = false;
        }
        
        // Telefonnummer validieren (nur Zahlen)
        if (phoneInput.value && !/^\d+$/.test(phoneInput.value)) {
            displayErrorMessage(phoneInput, 'Bitte geben Sie nur Zahlen ein');
            isValid = false;
        }
        
        // E-Mail validieren (muss @ enthalten)
        if (emailInput.value && !emailInput.value.includes('@')) {
            displayErrorMessage(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            isValid = false;
        }
        
        return isValid;
    }
}
