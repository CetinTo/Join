function openDatePicker(inputId) {
    let dateInput = document.getElementById(inputId);
    if (!dateInput) {
        console.error("Element not found: " + inputId);
        return;
    }
    let currentDate = new Date();
    
    flatpickr(dateInput, {
        dateFormat: "d/m/Y",  
        defaultDate: currentDate, 
        locale: flatpickr.l10ns.de, 
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
