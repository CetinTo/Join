/**
 * @type {HTMLElement} Placeholder element used during drag-and-drop.
 */
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("placeholder-drag");

/**
 * Fügt Spalten ohne Aufgaben ein leeres Bild hinzu.
 */
function ensureEmptyStateImages() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    const hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (!hasTasks && !column.querySelector(".empty-state-img")) {
      const img = document.createElement("img");
      img.src = "../img/no-tasks-to-do.png";
      img.alt = "no tasks to do";
      img.classList.add("empty-state-img");
      column.appendChild(img);
    }
  });
  checkColumns();
}

/**
 * Zeigt oder versteckt leere Statusbilder je nach Spalteninhalt.
 */
function checkColumns() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    const imgElement = column.querySelector(".empty-state-img");
    const hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (imgElement) imgElement.style.display = hasTasks ? "none" : "block";
  });
}

/**
 * Ermittelt das Element, nach dem das gezogene Element eingefügt werden soll.
 * @param {HTMLElement} container - Der Spaltencontainer.
 * @param {number} y - Vertikale Koordinate.
 * @returns {HTMLElement|undefined} Das Bezugselement.
 */
function getDragAfterElement(container, y) {
  const draggable = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return draggable.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    },
    { offset: -Infinity }
  ).element;
}

/**
 * Handler für dragstart bei Desktop.
 * @param {DragEvent} e
 */
function handleTaskDragStart(e) {
  selectedTask = e.target;
  setTimeout(() => {
    selectedTask.classList.add("dragging");
    selectedTask.style.transform = "rotate(5deg) scale(1.05)";
  }, 0);
}

/**
 * Handler für dragend bei Desktop.
 */
function handleTaskDragEnd() {
  if (selectedTask) {
    selectedTask.classList.remove("dragging");
    selectedTask.style.transform = "rotate(0deg) scale(1)";
    selectedTask = null;
  }
  if (dragPlaceholder.parentNode) dragPlaceholder.parentNode.removeChild(dragPlaceholder);
  checkColumns();
}

/**
 * Bindet Desktop-Drag-Events an eine Aufgabe.
 * @param {HTMLElement} task
 */
function attachDesktopDragEvents(task) {
  task.addEventListener("dragstart", handleTaskDragStart);
  task.addEventListener("dragend", handleTaskDragEnd);
}

/**
 * Updates the position of the drag placeholder for each column based on touch coordinates.
 * @param {Touch} touch - The touch event.
 * @param {HTMLElement[]} columns - An array of column elements.
 */
function updateDragPlaceholderForColumns(touch, columns) {
  columns.forEach(column => {
    if (isTouchInsideElement(touch, column)) {
      const afterEl = getDragAfterElement(column, touch.clientY);
      updateColumnWithPlaceholder(column, afterEl);
    }
  });
}

/**
 * Checks if the touch coordinates are within the element's bounding rectangle.
 * @param {Touch} touch - The touch event.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} True if the touch is inside the element, otherwise false.
 */
function isTouchInsideElement(touch, element) {
  const rect = element.getBoundingClientRect();
  return (
    touch.clientX >= rect.left &&
    touch.clientX <= rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY <= rect.bottom
  );
}

/**
 * Updates the specified column with the drag placeholder based on the reference element.
 * @param {HTMLElement} column - The column element.
 * @param {HTMLElement|null} afterEl - The element after which the placeholder should be inserted.
 */
function updateColumnWithPlaceholder(column, afterEl) {
  if (!afterEl) {
    if (!column.contains(dragPlaceholder)) {
      column.appendChild(dragPlaceholder);
    }
  } else {
    if (afterEl.parentElement === column) {
      column.insertBefore(dragPlaceholder, afterEl);
    } else {
      column.appendChild(dragPlaceholder);
    }
  }
}


/**
 * Startet den Touch-Drag-Vorgang.
 * @param {HTMLElement} task
 * @param {Touch} touch
 */
function startTouchDragging(task, touch) {
  selectedTask = task;
  task.classList.add("dragging");
  task.style.transform = "rotate(5deg) scale(1.05)";
  task.style.position = "fixed";
  task.style.zIndex = "1000";
  const rect = task.getBoundingClientRect();
  task.dataset.offsetX = (touch.clientX - rect.left).toString();
  task.dataset.offsetY = (touch.clientY - rect.top).toString();
}

/**
 * Aktualisiert die Position einer Aufgabe basierend auf Touch-Koordinaten.
 * @param {HTMLElement} task
 * @param {Touch} touch
 */
function updateTaskPosition(task, touch) {
  const offsetX = parseFloat(task.dataset.offsetX) || 0;
  const offsetY = parseFloat(task.dataset.offsetY) || 0;
  task.style.left = `${touch.clientX - offsetX}px`;
  task.style.top = `${touch.clientY - offsetY}px`;
}

/**
 * Setzt das Styling einer Aufgabe zurück.
 * @param {HTMLElement} task
 */
function resetTask(task) {
  task.classList.remove("dragging");
  task.style.transform = "rotate(0deg) scale(1)";
  task.style.position = task.style.zIndex = "";
}

/**
 * Ermittelt das Drop-Ziel anhand eines Touch-Events.
 * @param {Touch} touch
 * @returns {HTMLElement|null}
 */
function getDropTargetFromTouch(touch) {
  let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  while (dropTarget && !dropTarget.classList.contains("task-board-container")) {
    dropTarget = dropTarget.parentElement;
  }
  return dropTarget;
}

/* ---------- Touch-Handler als separate Funktionen ---------- */

/**
 * Handler für touchstart.
 * @param {TouchEvent} e
 */
function handleTouchStart(e) {
  const task = e.currentTarget;
  const state = task._touchDragState;
  const touch = e.touches[0];
  state.initialTouchX = touch.clientX;
  state.initialTouchY = touch.clientY;
  state.longPressTimeout = setTimeout(() => {
    state.isTouchDragging = true;
    startTouchDragging(task, touch);
  }, 500);
}

/**
 * Handler für touchmove.
 * @param {TouchEvent} e
 */
function handleTouchMove(e) {
  const task = e.currentTarget;
  const state = task._touchDragState;
  const touch = e.touches[0];
  if (!state.isTouchDragging) {
    const dx = Math.abs(touch.clientX - state.initialTouchX);
    const dy = Math.abs(touch.clientY - state.initialTouchY);
    if (dx > state.moveThreshold || dy > state.moveThreshold) {
      clearTimeout(state.longPressTimeout);
      return;
    }
  }
  if (!state.isTouchDragging) return;
  e.preventDefault();
  updateTaskPosition(task, touch);
  updateDragPlaceholderForColumns(touch, state.columns);
}

/**
 * Handler für touchend.
 * @param {TouchEvent} e
 */
function handleTouchEnd(e) {
  const task = e.currentTarget, state = task._touchDragState; clearTimeout(state.longPressTimeout);
  if (state.isTouchDragging && selectedTask === task) {
    const touch = e.changedTouches[0], dropTarget = getDropTargetFromTouch(touch);
    if (dropTarget) {
      dropTarget.contains(dragPlaceholder)
        ? dropTarget.insertBefore(task, dragPlaceholder)
        : dropTarget.appendChild(task), updateTaskColumnInFirebase(task.id, dropTarget.id);
    } else {
      task.style.position = "";
    }
    resetTask(task);
    selectedTask = null; state.isTouchDragging = false; dragPlaceholder.parentNode && dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    checkColumns();
  }
}

/**
 * Handler für touchcancel.
 * @param {TouchEvent} e
 */
function handleTouchCancel(e) {
  const task = e.currentTarget, state = task._touchDragState;
  clearTimeout(state.longPressTimeout);
  state.isTouchDragging = false;
}

/**
 * Bindet Touch-Drag-Events an eine Aufgabe und speichert den benötigten Status am Element.
 * @param {HTMLElement} task
 * @param {HTMLElement[]} columns
 */
function attachTouchDragEvents(task, columns) {
  task._touchDragState = {
    longPressTimeout: null,
    isTouchDragging: false,
    initialTouchX: 0,
    initialTouchY: 0,
    moveThreshold: 10,
    columns: columns
  };
  task.addEventListener("touchstart", handleTouchStart);
  task.addEventListener("touchmove", handleTouchMove);
  task.addEventListener("touchend", handleTouchEnd);
  task.addEventListener("touchcancel", handleTouchCancel);
}

/**
 * Bindet dragover-Event an eine Spalte.
 * @param {HTMLElement} column
 */
function attachColumnDragOverEvent(column) {
  column.addEventListener("dragover", e => {
    e.preventDefault();
    const afterEl = getDragAfterElement(column, e.clientY);
    if (!afterEl) {
      if (!column.contains(dragPlaceholder)) column.appendChild(dragPlaceholder);
    } else {
      afterEl.parentElement === column
        ? column.insertBefore(dragPlaceholder, afterEl)
        : column.appendChild(dragPlaceholder);
    }
  });
}

/**
 * Bindet drop-Event an eine Spalte.
 * @param {HTMLElement} column
 */
function attachColumnDropEvent(column) {
  column.addEventListener("drop", e => {
    e.preventDefault();
    if (selectedTask) {
      if (column.contains(dragPlaceholder)) {
        column.insertBefore(selectedTask, dragPlaceholder);
      } else {
        column.appendChild(selectedTask);
      }
      selectedTask.classList.remove("dragging");
      selectedTask.style.transform = "rotate(0deg) scale(1)";
      updateTaskColumnInFirebase(selectedTask.id, column.id);
    }
    dragPlaceholder.parentNode && dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    checkColumns();
  });
}

/**
 * Initialisiert Drag-Events für Aufgaben.
 * @param {NodeListOf<HTMLElement>} tasks
 * @param {NodeListOf<HTMLElement>} columns
 */
function initializeTasks(tasks, columns) {
  tasks.forEach(task => {
    attachDesktopDragEvents(task);
    attachTouchDragEvents(task, Array.from(columns));
  });
}

/**
 * Initialisiert Drag-Events für Spalten.
 * @param {NodeListOf<HTMLElement>} columns
 */
function initializeColumns(columns) {
  columns.forEach(column => {
    attachColumnDragOverEvent(column);
    attachColumnDropEvent(column);
  });
}

/**
 * Initialisiert das Drag-and-Drop-Verhalten.
 */
function initializeDragAndDrop() {
  const tasks = document.querySelectorAll(".draggable-cards");
  const columns = document.querySelectorAll(".task-board-container");
  initializeTasks(tasks, columns);
  initializeColumns(columns);
}

document.addEventListener("DOMContentLoaded", () => {
  ensureEmptyStateImages();
  initializeDragAndDrop();
});