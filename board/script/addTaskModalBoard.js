// Start: Warten, bis der DOM geladen ist
document.addEventListener("DOMContentLoaded", initTaskForm);

/**
 * Initialisiert alle Teilbereiche des Task-Formulars.
 */
function initTaskForm() {
  bindCreateButton();
  bindInputValidation();
  observeAssignedProfiles();
  bindPrioritySelection();
  bindCategorySelection();
  bindSubtaskManagement();
  validateForm();
}

/* --------------------- BUTTON BINDINGS --------------------- */

/**
 * Bindet den Create-Button neu, um doppelte Listener zu vermeiden.
 */
function bindCreateButton() {
  const btn = getUniqueCreateButton();
  if (!btn) return;
  btn.addEventListener("click", createTaskHandler);
}

/**
 * Sucht den aktuellen Create-Button, klont ihn und ersetzt den alten.
 * @returns {HTMLElement|null} Den neuen Button oder null, falls nicht gefunden.
 */
function getUniqueCreateButton() {
  const oldBtn = document.querySelector(".create-btn");
  if (!oldBtn) return null;
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  return newBtn;
}

/**
 * Event-Handler, der beim Klick auf den Create-Button ausgeführt wird.
 */
async function createTaskHandler(e) {
  const btn = e.currentTarget;
  if (!validateForm()) return;
  btn.disabled = true;
  try {
    await addTaskToFirebase();
  } catch (error) {
    console.error("Task creation failed", error);
  } finally {
    btn.disabled = false;
  }
}

/* --------------------- INPUT VALIDATION --------------------- */

/**
 * Bindet alle relevanten Input-Elemente an die Validierungsfunktion.
 */
function bindInputValidation() {
  const selectors = [
    ".input",
    ".date-input",
    ".select-task",
    ".priority-container",
    ".description",
    ".subtask"
  ];
  selectors.forEach(addValidationListener);
}

/**
 * Hängt an das Element, das per Selector gefunden wird, einen Event-Listener an.
 * @param {string} selector - Der CSS-Selektor.
 */
function addValidationListener(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const eventType = selector === ".select-task" ? "change" : "input";
    element.addEventListener(eventType, validateForm);
  }
}

/* --------------------- MUTATION OBSERVER --------------------- */

/**
 * Beobachtet Änderungen im Container der zugewiesenen Profile.
 */
function observeAssignedProfiles() {
  const container = document.querySelector(".assigned-to-profiles-container");
  if (container) {
    const observer = new MutationObserver(validateForm);
    observer.observe(container, { childList: true });
  }
}

/* --------------------- PRIORITY SELECTION --------------------- */

/**
 * Bindet Klick-Events an die einzelnen Prioritätsoptionen.
 */
function bindPrioritySelection() {
  const options = document.querySelectorAll(".priority-container div");
  options.forEach(option => {
    option.addEventListener("click", () => {
      removeActiveClass(options);
      option.classList.add("active");
      validateForm();
    });
  });
}

/**
 * Entfernt die Klasse 'active' von allen Optionen.
 * @param {NodeList} options - Die Liste der Prioritätsoptionen.
 */
function removeActiveClass(options) {
  options.forEach(o => o.classList.remove("active"));
}

/* --------------------- CATEGORY SELECTION --------------------- */

/**
 * Bindet Klick-Events an die Kategorie-Items und synchronisiert die Auswahl.
 */
function bindCategorySelection() {
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', () => handleCategorySelection(categoryItems, item));
  });
}

/**
 * Behandelt die Auswahl eines Kategorie-Items.
 * @param {NodeList} items - Alle Kategorie-Items.
 * @param {HTMLElement} item - Das geklickte Element.
 */
function handleCategorySelection(items, item) {
  items.forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');
  updateCategoryText(item);
  updateCategorySelect(item);
  validateForm();
}

/**
 * Aktualisiert den angezeigten Kategorie-Text.
 * @param {HTMLElement} item - Das ausgewählte Element.
 */
function updateCategoryText(item) {
  const categoryDisplay = document.querySelector('.category-selected');
  if (categoryDisplay) categoryDisplay.textContent = item.textContent;
}

/**
 * Setzt den Wert des versteckten Select-Elements.
 * @param {HTMLElement} item - Das ausgewählte Element.
 */
function updateCategorySelect(item) {
  const select = document.querySelector(".select-task");
  if (select) select.value = item.getAttribute("data-value");
}

/* --------------------- SUBTASK MANAGEMENT --------------------- */

/**
 * Bindet die Funktionen zum Hinzufügen und Löschen von Subtasks.
 */
function bindSubtaskManagement() {
  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");

  if (!addSubtaskBtn || !subtaskInput || !subtasksContainer) return;

  addSubtaskBtn.addEventListener("click", () => handleAddSubtask(subtaskInput, subtasksContainer));
  subtasksContainer.addEventListener("click", handleSubtaskDeletion);
}

/**
 * Verarbeitet das Hinzufügen einer neuen Subtask.
 * @param {HTMLElement} subtaskInput - Das Input-Feld für Subtasks.
 * @param {HTMLElement} container - Der Container, in den die Subtask eingefügt wird.
 */
function handleAddSubtask(subtaskInput, container) {
  const text = subtaskInput.value.trim();
  if (text !== "") {
    const newItem = createSubtaskItem(text);
    container.appendChild(newItem);
    subtaskInput.value = "";
    validateForm();
  }
}

/**
 * Erzeugt ein neues Subtask-Element.
 * @param {string} text - Der Subtask-Text.
 * @returns {HTMLElement} Das neu erzeugte Subtask-Element.
 */
function createSubtaskItem(text) {
  const newItem = document.createElement("div");
  newItem.classList.add("subtask-item", "added-subtasks");
  newItem.innerHTML = `
    <span>${text}</span>
    <img src="../img/subtask-delete.png" alt="Delete Subtask" class="subtask-icon delete-icon" />
  `;
  return newItem;
}

/**
 * Event-Handler zum Löschen einer Subtask.
 * @param {Event} e - Das Eventobjekt.
 */
function handleSubtaskDeletion(e) {
  if (e.target.classList.contains("delete-icon")) {
    e.target.parentElement.remove();
    validateForm();
  }
}

/* --------------------- FIREBASE FUNCTIONS --------------------- */

/**
 * Sendet die Task-Daten an Firebase.
 */
async function addTaskToFirebase() {
  const firebaseURL = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  const taskData = getTaskData();

  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    const resData = await response.json();
    const firebaseId = resData.name;
    if (!firebaseId) return;

    await updateFirebaseTaskId(firebaseURL, firebaseId);
    clearForm();
    closeModal();
    location.reload();
  } catch (error) {
    console.error("Error while saving task to Firebase", error);
  }
}

/**
 * Stellt das Task-Datenobjekt zusammen.
 * @returns {Object} Das Task-Datenobjekt.
 */
function getTaskData() {
  return {
    column: "toDoColumn",
    description: getInputValue(".description", "No description provided"),
    dueDate: getInputValue(".date-input"),
    id: null,
    priority: `../../img/priority-img/${getSelectedPriority()}.png`,
    progress: 0,
    title: getInputValue(".input"),
    users: getSelectedUsers(),
    subtasks: getSubtasks(),
    category: getSelectedCategory()
  };
}

/**
 * Aktualisiert in Firebase den Task mit der eigenen ID.
 * @param {string} url - Die Firebase URL.
 * @param {string} firebaseId - Die von Firebase zurückgegebene ID.
 */
async function updateFirebaseTaskId(url, firebaseId) {
  const updateURL = url.replace(".json", `/${firebaseId}/id.json`);
  await fetch(updateURL, {
    method: "PUT",
    body: JSON.stringify(firebaseId)
  });
}

/* --------------------- UTILITY FUNCTIONS --------------------- */

/**
 * Gibt den getrimmten Wert eines Input-Feldes zurück.
 * @param {string} selector - Der CSS-Selektor des Input-Feldes.
 * @param {string} [fallback=""] - Ein Fallback-Wert, falls nichts gefunden wird.
 * @returns {string} Der Wert des Input-Feldes.
 */
function getInputValue(selector, fallback = "") {
  return document.querySelector(selector)?.value.trim() || fallback;
}

/**
 * Liest die aktuell ausgewählte Priorität aus.
 * @returns {string} Den Prioritätswert oder 'low' als Standard.
 */
function getSelectedPriority() {
  return document.querySelector(".priority-container .active")?.dataset.priority || "low";
}

/**
 * Ermittelt die ausgewählten Benutzer.
 * @returns {Array} Array von Objekten mit Benutzernamen.
 */
function getSelectedUsers() {
  return [...document.querySelectorAll(".assigned-to-profiles-container div")]
    .map(user => ({ name: user.innerText.trim() })) || [{ name: "Unassigned" }];
}

/**
 * Liest alle vorhandenen Subtasks aus.
 * @returns {Array} Array von Subtask-Objekten.
 */
function getSubtasks() {
  return [...document.querySelectorAll(".subtasks-scroll-container .subtask-item span")].map(span => ({
    completed: false,
    text: span.innerText.trim()
  }));
}

/**
 * Ermittelt die aktuell ausgewählte Kategorie.
 * @returns {string} Der Wert der ausgewählten Kategorie oder ein Standardwert.
 */
function getSelectedCategory() {
  const activeItem = document.querySelector(".category-item.selected");
  return activeItem ? activeItem.dataset.value : "Technical task";
}

/**
 * Löscht alle Eingaben und entfernt ausgewählte Elemente.
 */
function clearForm() {
  [".input", ".description", ".date-input", ".select-task", ".subtask"].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.value = "";
  });
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (subtasksContainer) subtasksContainer.innerHTML = "";
}

/**
 * Schließt das Task-Modal.
 */
function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.style.display = "none";
}

/**
 * Validiert das Formular und passt den Status des Create-Buttons an.
 * @returns {boolean} true, wenn das Formular gültig ist, ansonsten false.
 */
function validateForm() {
  const title = getInputValue(".input");
  const dueDate = getInputValue(".date-input");
  const category = document.querySelector(".category-item.selected")?.dataset.value;
  const assignedUsers = document.querySelectorAll(".assigned-to-profiles-container div").length > 0;
  const prioritySelected = !!document.querySelector(".priority-container .active");
  const hasSubtask = document.querySelectorAll(".added-subtasks").length > 0;

  const createBtn = document.querySelector(".create-btn");
  const isValid = title && dueDate && category && assignedUsers && prioritySelected && hasSubtask;

  if (!createBtn) return false;

  if (isValid) {
    createBtn.classList.remove("disabled");
    createBtn.style.pointerEvents = "auto";
    createBtn.style.opacity = "1";
  } else {
    createBtn.classList.add("disabled");
    createBtn.style.pointerEvents = "none";
    createBtn.style.opacity = "0.5";
  }

  return isValid;
}

