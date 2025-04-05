

window.closeModalAndReload = closeModalAndReload;

/**
 * Array for storing tasks.
 * @type {Array<Object>}
 */
let tasks = [];

/**
 * Calculates the initials of a full name.
 * If the name consists of multiple parts, the first letters of the first and last parts are combined.
 * Otherwise, the first two letters of the name are used.
 * @param {string} fullName - The full name of the user.
 * @returns {string} The user's initials.
 */
function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

/**
 * Returns a random color from a predefined array.
 * @returns {string} A random color.
 */
function getRandomColor() {
  const colors = ["red", "green", "blue", "pink", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Enhances each task in the array by setting initials and a random color for each user,
 * if not already present.
 * @param {Array<Object>} tasks - Array of tasks.
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
 * Loads tasks from Firebase, filters out invalid entries, and enhances them with user data.
 * @async
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of tasks.
 */
async function loadTasksFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error loading tasks");
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

/**
 * Closes all visible dropdowns when clicked outside.
 */
document.addEventListener("click", function() {
  document.querySelectorAll(".move-to-dropdown.visible").forEach(function(dropdown) {
    dropdown.classList.remove("visible");
  });
});

/**
 * Filters tasks based on a search term.
 * Only displays tasks whose title or description contains the search term.
 * @param {string} searchTerm - The search term (in lowercase).
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
 * Sets up drag & drop by attaching event listeners to cards and columns.
 */
function enableDragAndDrop() {
  attachDragListenersToCards();
  attachDragOverListenersToColumns();
}

/**
 * Attaches 'dragstart' and 'dragend' event listeners to all draggable cards.
 */
function attachDragListenersToCards() {
  const cards = document.querySelectorAll('.draggable-cards');
  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
}

/**
 * Attaches 'dragover' event listeners to all columns to allow dropping of cards.
 */
function attachDragOverListenersToColumns() {
  const columns = document.querySelectorAll('.task-board-container');
  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingCard = document.querySelector('.dragging');
      if (draggingCard) {
        column.appendChild(draggingCard);
      }
    });
  });
}


/**
 * Loads tasks, generates task elements, activates drag & drop,
 * checks columns, and sets up the search event.
 */
document.addEventListener("DOMContentLoaded", async () => {
  tasks = await loadTasksFromFirebase();
  generateTasks(tasks);
  enableDragAndDrop();
  checkColumns();
  document.getElementById("searchInput").addEventListener("input", function () {
    filterTasks(this.value.trim().toLowerCase());
  });
});

/**
 * Closes the task modal and reloads the page.
 */
function closeModalAndReload() {
  const modal = document.getElementById('toggleModalFloating');
  if (modal) {
    modal.style.display = 'none';
  }
  location.reload();
}

/**
 * Closes the modal when clicking on the background and reloads the page.
 */
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
 * Reloads the current page.
 */
function reloadPage() {
  location.reload();
}
