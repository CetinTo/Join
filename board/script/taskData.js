import { 
  generateTasks,
  checkColumns
} from './taskDataTemplate.js';

/**
 * Array zur Speicherung der Aufgaben.
 * @type {Array<Object>}
 */
let tasks = [];

/**
 * Berechnet die Initialen eines vollen Namens.
 * Falls der Name mehr als einen Teil hat, werden die ersten Buchstaben
 * des ersten und letzten Teils kombiniert. Andernfalls werden die ersten zwei
 * Buchstaben des Namens verwendet.
 * @param {string} fullName - Der vollständige Name des Benutzers.
 * @returns {string} Die Initialen des Benutzers.
 */
function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Gibt eine zufällige Farbe aus einem vordefinierten Array zurück.
 * @returns {string} Eine zufällige Farbe.
 */
function getRandomColor() {
  const colors = ["red", "green", "blue", "pink", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Erweitert jede Aufgabe im Array, indem für jeden Benutzer Initialen
 * und eine zufällige Farbe gesetzt werden, falls diese noch nicht vorhanden sind.
 * @param {Array<Object>} tasks - Array von Aufgaben.
 */
function enrichTasksWithUserData(tasks) {
  tasks.forEach(task => {
    if (!task.users) return;
    task.users.forEach(user => {
      if (!user.initials) user.initials = getInitials(user.name);
      if (!user.color) user.color = getRandomColor();
    });
  });
}

/**
 * Lädt Aufgaben aus Firebase, filtert ungültige Einträge und erweitert sie mit Benutzerdaten.
 * @async
 * @returns {Promise<Array<Object>>} Ein Promise, das ein Array von Aufgaben zurückgibt.
 */
async function loadTasksFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fehler beim Laden");
    let data = await response.json();
    if (!data || typeof data !== "object") return [];
    let tasksArray = Object.entries(data)
      .filter(([key]) => key !== "null" && key !== "task-3")
      .map(([key, value]) => ({ firebaseKey: key, ...value }));
    enrichTasksWithUserData(tasksArray);
    return tasksArray;
  } catch (error) {
    return [];
  }
}

// Globaler Klick-Listener, der alle sichtbaren Dropdowns schließt, wenn außerhalb geklickt wird.
document.addEventListener("click", function() {
  document.querySelectorAll(".move-to-dropdown.visible").forEach(function(dropdown) {
    dropdown.classList.remove("visible");
  });
});

/**
 * Filtert Aufgaben basierend auf einem Suchbegriff.
 * Zeigt nur Aufgaben an, deren Titel oder Beschreibung den Suchbegriff enthalten.
 * @param {string} searchTerm - Der zu filternde Suchbegriff (in Kleinbuchstaben).
 */
function filterTasks(searchTerm) {
  const tasksElements = document.querySelectorAll(".draggable-cards");
  let found = false;
  tasksElements.forEach(task => {
    const title = task.dataset.title || "";
    const description = task.dataset.description || "";
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      task.style.display = "flex";
      found = true;
    } else {
      task.style.display = "none";
    }
  });
  document.getElementById("errorTaskFound").style.display = found ? "none" : "block";
}

/**
 * Richtet Drag & Drop ein.
 * Es werden die notwendigen Event-Listener an den Karten (draggable-cards)
 * sowie an den Spalten (task-board-container) eingerichtet.
 */
function enableDragAndDrop() {
  // Für alle Karten: Bei dragstart wird eine Klasse hinzugefügt.
  const cards = document.querySelectorAll('.draggable-cards');
  cards.forEach(card => {
    card.addEventListener('dragstart', function () {
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
    });
  });

  // Für alle Spalten: Beim Dragover erlauben wir den Drop und fügen ggf. die Karte ein.
  const columns = document.querySelectorAll('.task-board-container');
  columns.forEach(column => {
    column.addEventListener('dragover', function (e) {
      e.preventDefault();
      const draggingCard = document.querySelector('.dragging');
      if (draggingCard) {
        column.appendChild(draggingCard);
      }
    });
  });
}

// Sobald das DOM geladen ist, Tasks laden und darstellen.
document.addEventListener("DOMContentLoaded", async () => {
  tasks = await loadTasksFromFirebase();
  generateTasks(tasks);
  
  // Drag & Drop aktivieren
  enableDragAndDrop();

  // Spalten überprüfen (Platzhalterbilder korrekt anzeigen/verbergen)
  checkColumns();

  // Such-Event
  document.getElementById("searchInput").addEventListener("input", function () {
    filterTasks(this.value.trim().toLowerCase());
  });
});

/**
 * Schließt das Task-Modal und lädt die Seite neu.
 */
function closeModalAndReload() {
  const modal = document.getElementById('toggleModalFloating');
  if (modal) {
    modal.style.display = 'none';
  }
  location.reload();
}

// Schließt das Modal, wenn man auf den Hintergrund klickt:
document.addEventListener("DOMContentLoaded", function() {
  const floatingModal = document.getElementById('toggleModalFloating');
  const modalContent = document.querySelector('.main-section-task-overlay');
  if (floatingModal && modalContent) {
    floatingModal.addEventListener('click', function(event) {
      if (event.target === floatingModal) {
        floatingModal.style.display = 'none';
        location.reload();
      }
    });
    modalContent.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
});

/**
 * Lädt die aktuelle Seite neu.
 */
function reloadPage() {
  location.reload();
}
