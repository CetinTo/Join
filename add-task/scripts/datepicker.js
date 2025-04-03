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



