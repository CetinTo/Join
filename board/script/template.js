/**
 * Erstellt den HTML-Inhalt für die Kontaktinformationen.
 * @param {string} name - Der Name des Kontakts.
 * @param {Function} getInitials - Funktion zur Ermittlung der Initialen.
 * @param {Function} getColorClass - Funktion zur Bestimmung der Farbklasse.
 * @returns {string} HTML-String der Kontaktinformationen.
 */
function getContactInfoHTML(name, getInitials, getColorClass) {
  const initials = getInitials(name);
  const colorClass = getColorClass(name);
  return `
    <div class="contact-info">
      <span class="contact-initials profile-badge ${colorClass}">${initials}</span>
      <span class="contact-name">${name}</span>
    </div>
  `;
}

/**
 * Erstellt den HTML-Inhalt für das Checkbox-Element.
 * @param {string} name - Der Name des Kontakts.
 * @returns {string} HTML-String des Checkbox-Elements.
 */
function getCheckboxHTML(name) {
  return `
    <input type="checkbox" class="contact-checkbox" data-name="${name}" hidden>
    <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">
  `;
}

/**
 * Fügt dem Element die Toggle-Event-Listener hinzu.
 * @param {HTMLElement} element - Das Dropdown-Item.
 * @param {Object} contact - Das Kontaktobjekt.
 * @param {Function} toggleCheckboxState - Funktion zum Umschalten des Checkbox-Zustands.
 */
function attachToggleEvents(element, contact, toggleCheckboxState) {
  const checkboxImg = element.querySelector(".custom-checkbox");
  const toggle = event => {
    event.stopPropagation();
    toggleCheckboxState(contact, checkboxImg, element);
  };
  element.addEventListener("click", toggle);
  checkboxImg.addEventListener("click", toggle);
}

/**
 * Erstellt ein Dropdown-Item für einen Kontakt.
 * @param {Object} contact - Kontaktobjekt mit mindestens der Eigenschaft `name`.
 * @param {Function} getInitials - Funktion, die die Initialen aus einem Namen holt.
 * @param {Function} getColorClass - Funktion, die die CSS-Klasse für die Profilfarbe bestimmt.
 * @param {Function} toggleCheckboxState - Funktion, die den Checkbox-Zustand umschaltet.
 * @returns {HTMLElement} Das erstellte Dropdown-Item.
 */
export function createDropdownItem(contact, getInitials, getColorClass, toggleCheckboxState) {
  const itemElement = document.createElement("div");
  itemElement.classList.add("dropdown-item");
  itemElement.innerHTML = getContactInfoHTML(contact.name, getInitials, getColorClass) +
                          getCheckboxHTML(contact.name);
  attachToggleEvents(itemElement, contact, toggleCheckboxState);
  return itemElement;
}
