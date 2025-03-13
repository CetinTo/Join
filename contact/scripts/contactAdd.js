document.addEventListener("DOMContentLoaded", function () {
    const createContactBtn = document.querySelector(".create-btn");
    const openModalBtn = document.querySelector(".Contact-button");
    const modalOverlay = document.querySelector(".modal-overlay");
    const closeBtn = document.querySelector(".close-modal-button");
    const clearBtn = document.querySelector(".clear-btn");
  
    function openModal() {
      modalOverlay.style.display = "flex";
      setTimeout(() => {
        modalOverlay.classList.add("show-modal");
      }, 10);
    }
  
    function closeModal() {
      modalOverlay.classList.remove("show-modal");
      setTimeout(() => {
        modalOverlay.style.display = "none";
      }, 300);
    }
  
    openModalBtn.addEventListener("click", openModal);
  
    createContactBtn.addEventListener("click", async function () {
      const success = await saveContactToFirebase();
      if (success) closeModal();
    });
  
    closeBtn.addEventListener("click", closeModal);
    clearBtn.addEventListener("click", closeModal);
  
    modalOverlay.addEventListener("click", function (event) {
      if (event.target === modalOverlay) {
        closeModal();
      }
    });
  });
  
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
      "profile-badge-light-blue",
      "profile-badge-orange"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return classes[hash % classes.length];
  }
  
  function showSuccessPopup() {
    const successPopup = document.createElement("div");
    successPopup.classList.add("success-popup");
    successPopup.innerHTML = `<img src="../img/contactsuccesfullycreated.png" alt="Success" style="width: 100%;">`;
    document.body.appendChild(successPopup);
    setTimeout(() => {
      successPopup.classList.add("slide-in");
    }, 50);
    setTimeout(() => {
      successPopup.classList.remove("slide-in");
      successPopup.classList.add("slide-out");
      setTimeout(() => successPopup.remove(), 500);
    }, 2000);
  }
  
  async function saveContactToFirebase() {
    const name = document.querySelector("input[placeholder='Name']").value.trim();
    const email = document.querySelector("input[placeholder='Email']").value.trim();
    const phone = document.querySelector("input[placeholder='Telefonnummer']").value.trim();
    if (!name || !email || !phone) {
      alert("fehler");
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
      document.querySelector("input[placeholder='Name']").value = "";
      document.querySelector("input[placeholder='Email']").value = "";
      document.querySelector("input[placeholder='Telefonnummer']").value = "";
      loadContactsFromFirebase();
      return true;
    } catch (error) {
      alert("Fehler");
      return false;
    }
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    const modalOverlayEdit = document.querySelector(".modal-overlay-edit");
    const editModalContent = document.querySelector(".edit-contact-modal");
    const closeEditModalBtn = document.querySelector(".close-modal-button-edit");
    const saveEditBtn = document.querySelector(".save-edit-btn");
  
    document.addEventListener("click", function (event) {
      if (event.target.matches(".edit-contact-btn")) {
        openEditModal();
      }
    });
  
    function openEditModal(contact, contactId) {
      console.log("Öffne Edit-Modal für:", contact, contactId);
      
      // Modal anzeigen
      const modal = document.querySelector(".modal-overlay-edit");
      if (!modal) {
        console.error("Modal-Overlay nicht gefunden!");
        return;
      }
      
      modal.style.display = "flex";
      modal.classList.add("show-modal");
      
      // Eingabefelder füllen
      const nameInput = document.querySelector(".modal-overlay-edit input[placeholder='Name']");
      const emailInput = document.querySelector(".modal-overlay-edit input[placeholder='Email']");
      const phoneInput = document.querySelector(".modal-overlay-edit input[placeholder='Phone']");
      
      if (nameInput && emailInput && phoneInput) {
        nameInput.value = contact.name || "";
        emailInput.value = contact.email || "";
        phoneInput.value = contact.phone || "";
      } else {
        console.error("Eingabefelder nicht gefunden!");
      }
      
      // Profilbadge mit Initialen und Farbe setzen
      const profileBadge = document.getElementById('edit-contact-initials');
      console.log("Profile Badge Element:", profileBadge);
      
      if (profileBadge) {
        // Initialen setzen
        const initials = getInitials(contact.name);
        console.log("Generierte Initialen:", initials);
        profileBadge.textContent = initials;
        
        // Farbklasse anwenden
        profileBadge.className = 'profile-badge-big';
        
        // Farbklasse hinzufügen
        const colorClass = getColorClass(contact.name);
        console.log("Generierte Farbklasse:", colorClass);
        profileBadge.classList.add(colorClass);
      } else {
        console.error("Profile Badge Element nicht gefunden!");
      }
      
      // Save-Button konfigurieren
      const saveBtn = document.querySelector(".save-btn");
      if (saveBtn) {
        saveBtn.dataset.contactId = contactId;
        
        // Event-Listener für Save-Button
        saveBtn.onclick = function() {
          const name = nameInput.value.trim();
          const email = emailInput.value.trim();
          const phone = phoneInput.value.trim();
          
          if (!name || !email || !phone) {
            alert("Bitte alle Felder ausfüllen");
            return;
          }
          
          updateContactInFirebase(contactId, { name, email, phone });
          closeEditModal();
        };
      }
      
      // Delete-Button konfigurieren
      const deleteBtn = document.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.dataset.contactId = contactId;
        deleteBtn.onclick = function() {
          deleteContact(contactId);
          closeEditModal();
        };
      }
      
      // Close-Button konfigurieren
      const closeBtn = document.querySelector(".close-modal-button-edit");
      if (closeBtn) {
        closeBtn.onclick = closeEditModal;
      }
    }
  
    closeEditModalBtn.addEventListener("click", function () {
      closeEditModal();
    });
  
    modalOverlayEdit.addEventListener("click", function (event) {
      if (event.target === modalOverlayEdit) {
        closeEditModal();
      }
    });
  
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
  });
  
  /**
   * Hilfsfunktion zum Generieren von Initialen aus einem Namen
   */
  function getInitials(name) {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  