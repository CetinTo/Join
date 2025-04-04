/* --------------------- EVENT LISTENERS --------------------- */

/**
 * Handles edit button clicks and opens edit modal.
 */
document.addEventListener("click", async (event) => {
    if (event.target.matches(".edit-contact-btn")) {
      const id = event.target.dataset.contactId;
      const contact = await fetchContact(id);
      if (contact) openEditModal(contact, id);
    }
  });
  
  /**
   * Handles delete button clicks and deletes the contact.
   */
  document.addEventListener("click", async (event) => {
    if (event.target.matches(".delete-btn")) {
      const id = event.target.dataset.contactId ||
        event.target.closest(".delete-btn").dataset.contactId;
      if (id) await deleteContactFromFirebase(id);
    }
  });
  
  /**
   * Handles delete inside modal popup.
   */
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
  
  /**
   * Initializes contact list on DOM load.
   */
  document.addEventListener("DOMContentLoaded", loadContactsFromFirebase);
  
  /**
   * Handles back button click on small screens.
   */
  document.addEventListener('DOMContentLoaded', function() {
    const backImg = document.querySelector('.contacts_headline-resp img[alt="return button"]');
    if (backImg) {
      backImg.addEventListener('click', backToContactList);
    }
  });
  
  /**
   * Adjusts layout on window resize.
   */
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 925) {
      const body = document.querySelector('.Contacts-body');
      if (body) body.style.display = 'block';
      document.querySelector('.contacts-main-section').classList.remove('contact-selected');
    }
  });
  