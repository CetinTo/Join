/**
 * @fileoverview Haupt-Datei für die Aufgaben-Erstellung.
 */
import { initEventListeners } from './taskEvents.js';
import { validateTaskForm } from './taskValidation.js';
import { saveTaskToFirebase } from './taskStorage.js';
import { clearTaskForm } from './taskUtils.js';

document.addEventListener("DOMContentLoaded", initTaskPage);

/**
 * Initialisiert die Aufgaben-Seite mit allen nötigen Komponenten
 */
function initTaskPage() {
  try {
    initEventListeners();
    validateTaskForm();
  } catch (e) {
    console.error('Fehler bei Initialisierung:', e);
  }
}

/**
 * Verarbeitet die Erstellung einer neuen Aufgabe
 */
async function handleTaskCreation() {
<<<<<<< HEAD
  if (validateTaskForm()) {
    await saveTaskToFirebase();
    clearTaskForm();
=======
  if (!validateForm()) return;
  const createBtn = document.querySelector(".create-btn");
  createBtn.disabled = true;
  try {
    await addTaskToFirebase();
  } finally {
    createBtn.disabled = false;
  }
}

/** 
 * @type {boolean} Indicates if a task creation request is currently in progress.
 */
let isSaving = false;

/**
 * Creates a task object based on current form inputs.
 * @param {string} mainInputValue - The trimmed main input value.
 * @returns {object} The task data object.
 */
function getTaskData(mainInputValue) {
  const description = document.querySelector(".description").value.trim() || "No description provided";
  const dueDate = document.querySelector(".date-input").value;
  const priority = `../../img/priority-img/${
    document.querySelector(".priority-container .active")?.dataset.priority || "low"
  }.png`;
  const users = [...document.querySelectorAll(".assigned-to-profiles-container div")].map(
    user => ({ name: user.innerText.trim() })
  );
  const subtasks = [...document.querySelectorAll(".subtasks-scroll-container .added-subtasks")].map(
    () => ({ completed: false, text: mainInputValue })
  );
  const category = document.querySelector(".category-item.selected")?.dataset.value || "Technical task";
  return { column: "toDoColumn", description, dueDate, id: null, priority, title: mainInputValue, users, subtasks, category };
}

/**
 * Sends a POST request to Firebase to create a new task.
 * @param {object} taskData - The task data object.
 * @returns {Promise<string>} The Firebase-generated ID for the task.
 */
async function postTaskData(taskData) {
  const response = await fetch(
    "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    }
  );
  return (await response.json()).name;
}

/**
 * Updates the task record in Firebase with its new ID.
 * @param {string} firebaseId - The Firebase-generated ID.
 * @returns {Promise<void>}
 */
async function updateTaskId(firebaseId) {
  await fetch(
    `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${firebaseId}/id.json`,
    {
      method: "PUT",
      body: JSON.stringify(firebaseId)
    }
  );
}

/**
 * Adds a new task to Firebase by creating the task data, posting it, updating the record,
 * clearing the form, and redirecting to the board page.
 * @returns {Promise<void>}
 */
async function addTaskToFirebase() {
  if (isSaving) return;
  isSaving = true;
  const mainInputValue = document.querySelector(".input").value.trim();
  const taskData = getTaskData(mainInputValue);
  try {
    const firebaseId = await postTaskData(taskData);
    await updateTaskId(firebaseId);
    clearForm();
>>>>>>> cbba9f1fd1dc9bf42e0e320ce6fcb7160a8ecff7
    window.location.href = "../board/board.html";
  }
}

<<<<<<< HEAD
// Exportiere Funktionen für andere Module
export { handleTaskCreation };
=======


/**
 * @function validateForm
 * @description Checks if all required fields are filled and toggles the "Create" button accordingly.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function validateForm() {
  const isValid = [
    !!document.querySelector(".input").value.trim(),
    !!document.querySelector(".date-input").value,
    document.querySelectorAll(".assigned-to-profiles-container div").length > 0,
    document.querySelector(".priority-container .active"),
    document.querySelector(".category-item.selected"),
  ].every(Boolean);

  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.classList.toggle("disabled", !isValid);
    createBtn.style.pointerEvents = isValid ? "auto" : "none";
    createBtn.style.opacity = isValid ? "1" : "0.5";
  }
  return isValid;
}

/**
 * @function clearForm
 * @description Resets all form fields and removes dynamically added subtasks and assigned user elements.
 * @returns {void}
 */
function clearForm() {
  document.querySelector(".input").value = "";
  document.querySelector(".description").value = "";
  document.querySelector(".date-input").value = "";
  document.querySelector(".subtask").value = "";
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
  document.querySelectorAll(".added-subtasks").forEach(item => item.remove());
}
>>>>>>> cbba9f1fd1dc9bf42e0e320ce6fcb7160a8ecff7
