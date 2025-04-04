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
  if (validateTaskForm()) {
    await saveTaskToFirebase();
    clearTaskForm();
    window.location.href = "../board/board.html";
  }
}

// Exportiere Funktionen für andere Module
export { handleTaskCreation };
