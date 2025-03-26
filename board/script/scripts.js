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

/**
 * Initializes the category dropdown functionality once the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
  const categoryDropdown = document.querySelector(".category-dropdown");
  const categorySelected = categoryDropdown.querySelector(".category-selected");
  const categoryOptions = categoryDropdown.querySelector(".category-options");
  const categoryItems = categoryDropdown.querySelectorAll(".category-item");
  const originalSelect = document.querySelector(".select-task");
  const dropdownIcon = categoryDropdown.querySelector(".dropdown-icon");

  if (!categoryDropdown || !categorySelected || !categoryOptions || !dropdownIcon) {
    return;
  }

  categoryDropdown.addEventListener("click", function (event) {
    const isOpen = categoryOptions.style.display === "block";
    categoryOptions.style.display = isOpen ? "none" : "block";
    dropdownIcon.src = isOpen ? "../img/arrow_drop_down.png" : "../img/arrow_drop_down_aktive.png";
    event.stopPropagation();
  });

  categoryItems.forEach(option => {
    option.addEventListener("click", function (event) {
      categorySelected.innerText = this.innerText;
      originalSelect.value = this.getAttribute("data-value");
      categoryOptions.style.display = "none";
      dropdownIcon.src = "../img/arrow_drop_down.png";
      event.stopPropagation();
      validateForm();
    });
  });

  document.addEventListener("click", function (event) {
    if (!categoryDropdown.contains(event.target)) {
      categoryOptions.style.display = "none";
      dropdownIcon.src = "../img/arrow_drop_down.png";
    }
  });
});

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
      throw new Error(`Fehler beim Updaten der Task-Spalte: ${response.statusText}`);
    }
  } catch (error) {
  }
}
