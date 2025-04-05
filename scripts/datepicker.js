/**
 * Returns the default configuration for the flatpickr date picker.
 * @returns {object} The flatpickr configuration object.
 */
function getDefaultDatePickerConfig() {
  return {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    minDate: "today",
    locale: flatpickr.l10ns.de,
    allowInput: false,
    disableMobile: true,
    onChange: (selectedDates, dateStr, instance) => {
      handlePastDate(selectedDates, instance);
    }
  };
}

/**
 * Checks if the selected date is in the past and resets it to "today" if needed.
 * @param {Date[]} selectedDates - The array of selected dates.
 * @param {object} instance - The flatpickr instance.
 */
function handlePastDate(selectedDates, instance) {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (selectedDates.length > 0 && selectedDates[0] < currentDate) {
    instance.setDate("today", true);
    alert("Das ausgewählte Datum liegt in der Vergangenheit. Bitte wählen Sie ein aktuelles Datum.");
  }
}

/**
 * Opens or toggles a date picker for the given input element by ID.
 * @param {string} inputId - The ID of the input element.
 */
function openDatePicker(inputId) {
  const dateInput = document.getElementById(inputId);
  if (!dateInput) return;
  dateInput.setAttribute("readonly", "readonly");
  if (dateInput._flatpickr) {
    dateInput._flatpickr.isOpen ? dateInput._flatpickr.close() : dateInput._flatpickr.open();
  } else {
    flatpickr(dateInput, getDefaultDatePickerConfig());
    dateInput._flatpickr.open();
  }
}

/**
 * Opens a date picker for adding a task, and sets focus on the input.
 * @param {string} inputId - The ID of the input element.
 */
function openDatePickerAddTask(inputId) {
  const dateInput = document.getElementById(inputId);
  if (!dateInput) return;
  dateInput.setAttribute("readonly", "readonly");
  flatpickr(dateInput, getDefaultDatePickerConfig());
  dateInput.focus();
}




function setPriority(priority) {
    let allButtons = document.querySelectorAll('.priority-button-urgent, .priority-button-medium, .priority-button-low');
    let selectedButton = document.querySelector(`.priority-button-${priority}[onclick="setPriority('${priority}')"]`);
    
    if (selectedButton.classList.contains('active')) {
        selectedButton.classList.remove('active');
    } else {
        allButtons.forEach(button => button.classList.remove('active'));
        selectedButton.classList.add('active');
    }
}


