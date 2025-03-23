/**
 * Initializes the date picker using flatpickr
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
 * Sets the selected priority and updates button states
 * @param {string} priority - The selected priority ("urgent", "medium", "low")
 */
function setPriority(priority) {
  const allButtons = document.querySelectorAll('.priority-button-urgent, .priority-button-medium, .priority-button-low');
  const selectedButton = document.querySelector(`.priority-button-${priority}[onclick="setPriority('${priority}')"]`);

  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    deactivateAllPriorityButtons(allButtons);
    selectedButton.classList.add('active');
  }

  validateForm();
}

/**
 * Deactivates all priority buttons
 * @param {NodeListOf<HTMLElement>} buttons
 */
function deactivateAllPriorityButtons(buttons) {
  buttons.forEach(button => button.classList.remove('active'));
}

/**
 * Initializes the category dropdown
 */
function initCategoryDropdown() {
  const dropdown = document.querySelector(".category-dropdown");
  const selected = dropdown?.querySelector(".category-selected");
  const options = dropdown?.querySelector(".category-options");
  const items = dropdown?.querySelectorAll(".category-item");
  const select = document.querySelector(".select-task");
  const icon = dropdown?.querySelector(".dropdown-icon");

  if (!dropdown || !selected || !options || !icon || !select || !items) return;

  addDropdownToggle(dropdown, options, icon);
  setupCategoryItemClick(items, selected, options, icon, select);
  closeDropdownOnOutsideClick(dropdown, options, icon);
}

/**
 * Adds toggle functionality for the dropdown menu
 */
function addDropdownToggle(dropdown, options, icon) {
  dropdown.addEventListener("click", function (event) {
    const isOpen = options.style.display === "block";
    options.style.display = isOpen ? "none" : "block";
    icon.src = isOpen ? "../img/arrow_drop_down.png" : "../img/arrow_drop_down_aktive.png";
    event.stopPropagation();
  });
}

/**
 * Adds click event listeners to category items
 */
function setupCategoryItemClick(items, selected, options, icon, select) {
  items.forEach(option => {
    option.addEventListener("click", function (event) {
      selected.innerText = this.innerText;
      select.value = this.getAttribute("data-value");
      options.style.display = "none";
      icon.src = "../img/arrow_drop_down.png";
      event.stopPropagation();
      validateForm();
    });
  });
}

/**
 * Closes dropdown when clicking outside of it
 */
function closeDropdownOnOutsideClick(dropdown, options, icon) {
  document.addEventListener("click", function (event) {
    if (!dropdown.contains(event.target)) {
      options.style.display = "none";
      icon.src = "../img/arrow_drop_down.png";
    }
  });
}

// Init after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initCategoryDropdown();
});
