// template.js

/**
 * Creates a dropdown item for a contact.
 * @param {Object} contact - Contact object with properties at least `name` and optionally `color`.
 * @param {Function} getInitials - Function to get the initials from a full name.
 * @param {Function} getColorClass - Function to determine the CSS class for the profile color.
 * @param {Function} toggleCheckboxState - Function to toggle the checkbox state.
 * @returns {HTMLElement} The created dropdown item.
 */
export function createDropdownItem(contact, getInitials, getColorClass, toggleCheckboxState) {
    const initials = getInitials(contact.name);
    const colorClass = getColorClass(contact.name);
    
    const itemElement = document.createElement("div");
    itemElement.classList.add("dropdown-item");
  
    itemElement.innerHTML = `
      <div class="contact-info">
        <span class="contact-initials profile-badge ${colorClass}">${initials}</span>
        <span class="contact-name">${contact.name}</span>
      </div>
      <input type="checkbox" class="contact-checkbox" data-name="${contact.name}" hidden>
      <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">
    `;
  
    const checkboxImg = itemElement.querySelector(".custom-checkbox");
  
    // Toggle logic when clicking on the dropdown item or the checkbox image.
    itemElement.addEventListener("click", event => {
      event.stopPropagation();
      toggleCheckboxState(contact, checkboxImg, itemElement);
    });
  
    checkboxImg.addEventListener("click", event => {
      event.stopPropagation();
      toggleCheckboxState(contact, checkboxImg, itemElement);
    });
  
    return itemElement;
  }
  