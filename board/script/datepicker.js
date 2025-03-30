function openDatePicker(inputId) {
    let dateInput = document.getElementById(inputId);
    if (!dateInput) {
        console.error("Element not found: " + inputId);
        return;
    }
    
    // Verhindere manuelle Eingaben, indem das Feld readonly gesetzt wird:
    dateInput.setAttribute("readonly", "readonly");

    flatpickr(dateInput, {
        dateFormat: "d/m/Y",
        defaultDate: "today",
        minDate: "today",      // verhindert die Auswahl vergangener Tage über den Kalender
        locale: flatpickr.l10ns.de,
        allowInput: false,     // deaktiviert manuelle Eingaben
        onChange: function(selectedDates, dateStr, instance) {
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            if (selectedDates.length > 0 && selectedDates[0] < currentDate) {
                // Setzt das Datum auf heute, falls ein Datum in der Vergangenheit gewählt wurde
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
