function openDatePicker(inputId) {
    const dateInput = document.getElementById(inputId);
    if (!dateInput) return;
    
    dateInput.setAttribute("readonly", "readonly");
    
    if (dateInput._flatpickr) {
      dateInput._flatpickr.isOpen ? dateInput._flatpickr.close() : dateInput._flatpickr.open();
    } else {
      flatpickr(dateInput, {
        dateFormat: "d/m/Y",
        defaultDate: "today",
        minDate: "today",
        locale: flatpickr.l10ns.de,
        allowInput: false,
        disableMobile: true,
        onChange: function(selectedDates, dateStr, instance) {
          let currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);
          if (selectedDates.length > 0 && selectedDates[0] < currentDate) {
            instance.setDate("today", true);
            alert("Das ausgewählte Datum liegt in der Vergangenheit. Bitte wählen Sie ein aktuelles Datum.");
          }
        }
      });
      dateInput._flatpickr.open();
    }
}
  

function openDatePickerAddTask(inputId) {
  let dateInput = document.getElementById(inputId);
  if (!dateInput) return;
  

  dateInput.setAttribute("readonly", "readonly");

  flatpickr(dateInput, {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    minDate: "today",
    disableMobile: true, 
    locale: flatpickr.l10ns.de,
    allowInput: false,
    onChange: function(selectedDates, dateStr, instance) {
      if (selectedDates.length > 0 && selectedDates[0] < new Date().setHours(0, 0, 0, 0)) {
        instance.setDate("today", true);
        alert("Das ausgewählte Datum liegt in der Vergangenheit. Bitte wählen Sie ein aktuelles Datum.");
      }
    }
  });
  
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


