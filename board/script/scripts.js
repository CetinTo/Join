/**
 * Opens the date picker using flatpickr with the current date as default.
 */
function openDatePicker() {
  const dateInput = document.getElementById('date-input');
  const currentDate = new Date();
  flatpickr(dateInput, {
    dateFormat: "d/m/Y",
    defaultDate: currentDate,
    locale: flatpickr.l10ns.de
  });
  dateInput.focus();
}

/**
 * Sets the priority of a task by toggling the active class on the corresponding button.
 *
 * @param {string} priority - The priority level to set (e.g., "urgent", "medium", "low").
 */
function setPriority(priority) {
  const allButtons = document.querySelectorAll('.priority-button-urgent, .priority-button-medium, .priority-button-low');
  const selectedButton = document.querySelector(`.priority-button-${priority}[onclick="setPriority('${priority}')"]`);
  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    allButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
  }
  validateForm();
}

document.addEventListener("DOMContentLoaded", () => {
  initCategoryDropdown();
});

/**
 * Initializes the category dropdown by retrieving all necessary elements and binding events.
 */
function initCategoryDropdown() {
  const elems = getCategoryDropdownElements();
  if (!elems) return;
  bindCategoryDropdownEvents(elems);
  bindCategoryDocumentClick(elems);
}

/**
 * Retrieves all relevant elements for the category dropdown.
 * @returns {Object|null} An object with the dropdown elements or null if any are missing.
 */
function getCategoryDropdownElements() {
  const categoryDropdown = document.querySelector(".category-dropdown");
  if (!categoryDropdown) return null;
  const categorySelected = categoryDropdown.querySelector(".category-selected");
  const categoryOptions = categoryDropdown.querySelector(".category-options");
  const categoryItems = categoryDropdown.querySelectorAll(".category-item");
  const originalSelect = document.querySelector(".select-task");
  const dropdownIcon = categoryDropdown.querySelector(".dropdown-icon");
  if (!categorySelected || !categoryOptions || !dropdownIcon) return null;
  return { categoryDropdown, categorySelected, categoryOptions, categoryItems, originalSelect, dropdownIcon };
}

/**
 * Binds event listeners directly required by the dropdown.
 * @param {Object} elems - The retrieved DOM elements.
 */
function bindCategoryDropdownEvents({ categoryDropdown, categoryOptions, dropdownIcon, categorySelected, originalSelect, categoryItems }) {
  categoryDropdown.addEventListener("click", event =>
    toggleCategoryDropdown(categoryOptions, dropdownIcon, event)
  );
  categoryItems.forEach(option =>
    option.addEventListener("click", event =>
      handleCategoryOptionClick(option, categorySelected, originalSelect, categoryOptions, dropdownIcon, event)
    )
  );
}

/**
 * Binds a global click listener to close the dropdown when clicking outside.
 * @param {Object} elems - The retrieved DOM elements.
 */
function bindCategoryDocumentClick({ categoryDropdown, categoryOptions, dropdownIcon }) {
  document.addEventListener("click", event =>
    closeCategoryDropdown(categoryDropdown, categoryOptions, dropdownIcon, event)
  );
}

/**
 * Toggles the visibility of the dropdown and updates the icon.
 * @param {HTMLElement} categoryOptions - The dropdown options container.
 * @param {HTMLElement} dropdownIcon - The icon element.
 * @param {Event} event - The click event.
 */
function toggleCategoryDropdown(categoryOptions, dropdownIcon, event) {
  const isOpen = categoryOptions.style.display === "block";
  categoryOptions.style.display = isOpen ? "none" : "block";
  dropdownIcon.src = isOpen ? "../img/arrow_drop_down.png" : "../img/arrow_drop_down_aktive.png";
  event.stopPropagation();
}

/**
 * Updates the selected value, closes the dropdown, and validates the form.
 * @param {HTMLElement} option - The clicked dropdown option.
 * @param {HTMLElement} categorySelected - The element showing the selected category.
 * @param {HTMLElement} originalSelect - The hidden select element.
 * @param {HTMLElement} categoryOptions - The dropdown options container.
 * @param {HTMLElement} dropdownIcon - The icon element.
 * @param {Event} event - The click event.
 */
function handleCategoryOptionClick(option, categorySelected, originalSelect, categoryOptions, dropdownIcon, event) {
  categorySelected.innerText = option.innerText;
  originalSelect.value = option.getAttribute("data-value");
  categoryOptions.style.display = "none";
  dropdownIcon.src = "../img/arrow_drop_down.png";
  event.stopPropagation();
  validateForm();
}

/**
 * Closes the dropdown if a click occurs outside of it.
 * @param {HTMLElement} categoryDropdown - The dropdown container.
 * @param {HTMLElement} categoryOptions - The dropdown options container.
 * @param {HTMLElement} dropdownIcon - The icon element.
 * @param {Event} event - The click event.
 */
function closeCategoryDropdown(categoryDropdown, categoryOptions, dropdownIcon, event) {
  if (!categoryDropdown.contains(event.target)) {
    categoryOptions.style.display = "none";
    dropdownIcon.src = "../img/arrow_drop_down.png";
  }
}

/**
 * Updates the task column in Firebase by sending a PATCH request.
 *
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @param {string} newColumn - The new column value to update in the task.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateTaskColumnInFirebase(taskId, newColumn) {
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: newColumn })
    });
    if (!response.ok) {
      throw new Error(`Error updating task column: ${response.statusText}`);
    }
  } catch (error) {
    // Error handling
  }
}
