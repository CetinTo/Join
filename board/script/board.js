/**
 * Adds a click listener to a button to open a specific modal.
 * @param {string} addButtonId - The ID of the button that opens the modal.
 * @param {string} modalId - The ID of the modal to be opened.
 */
function setupModalButton(addButtonId, modalId) {
  const addButton = document.getElementById(addButtonId);
  const modal = document.getElementById(modalId);
  if (!addButton || !modal) return;

  addButton.addEventListener('click', () => {
    modal.style.display = 'block';
  });
}

/**
 * Fügt einen globalen Event-Listener hinzu, der das Schließen des Modals ermöglicht,
 * wenn außerhalb des Modals geklickt wird.
 *
 * @param {string} modalId - Die ID des Modals, das geschlossen werden soll.
 */
function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Schaltet die Anzeige des Modals um.
 * Wird global als window.toggleModal zur Verfügung gestellt.
 */
function toggleModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
  }
}

/**
 * Initialisiert das Account-Dropdown, sodass beim Klick
 * auf den Account-Button das Dropdown-Menü angezeigt bzw. versteckt wird.
 */
function setupAccountDropdown() {
  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (!accountButton || !dropdownMenu) return;

  accountButton.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  });
}

/**
 * Ermöglicht die Weiterleitung zur Add-Task-Seite auf mobilen Geräten
 */
function setupMobileAddTaskRedirect() {
  // Add-Task-Button finden
  const addTaskButton = document.querySelector('.add-task-button');
  
  if (addTaskButton) {
    // Event-Listener für Klicks hinzufügen
    addTaskButton.addEventListener('click', function(event) {
      // Nur auf mobilen Geräten zwischen 300px und 500px Breite
      if (window.innerWidth >= 300 && window.innerWidth <= 500) {
        // Standard-Klick-Verhalten verhindern
        event.preventDefault();
        // Zur Add-Task-Seite weiterleiten (korrekter Pfad)
        window.location.href = '../add-task/addtask.html';
      }
    });
  }
}

// Initialisierung, sobald der DOM geladen ist
document.addEventListener("DOMContentLoaded", () => {
  // Modal-Buttons initialisieren
  setupModalButton('addTaskButtonTodo', 'taskModal');
  setupModalButton('addTaskButtonInProgress', 'taskModal');
  setupModalButton('addTaskButtonAwaitFeedback', 'taskModal');
  setupModalButton('addTaskButton', 'taskModal');

  // Mobile Weiterleitung einrichten
  setupMobileAddTaskRedirect();

  // Modal-Schließfunktion global einrichten
  setupModalClose('taskModal');

  // Account-Dropdown initialisieren
  setupAccountDropdown();

  // Globale Funktion toggleModal verfügbar machen
  window.toggleModal = toggleModal;
});
