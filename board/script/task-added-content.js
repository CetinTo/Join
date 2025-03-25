/**
 * Placeholder element for drag & drop.
 * @type {HTMLElement}
 */
let placeholder = document.createElement("div");

/**
 * Currently dragged task.
 * @type {HTMLElement|null}
 */
let selectedTask = null;

/**
 * Checks the "toDoColumn" for tasks and toggles the image display.
 */
function checkToDoColumn() {
  const toDo = document.getElementById("toDoColumn");
  const img = toDo.querySelector("img");
  if (!img) return;
  const hasTasks = toDo.querySelectorAll(".draggable-cards").length > 0;
  img.style.display = hasTasks ? "none" : "block";
}

/**
 * Wrapper function for checkToDoColumn.
 */
function checkColumns() {
  checkToDoColumn();
}

/**
 * Sets up drag-and-drop functionality for tasks and columns.
 */
function enableDragAndDrop() {
  addTaskEventListeners();
  addColumnEventListeners();
}

/**
 * Adds dragstart and dragend event listeners to all tasks.
 */
function addTaskEventListeners() {
  const tasks = document.querySelectorAll(".draggable-cards");
  tasks.forEach(task => {
    addDragStartEvent(task);
    addDragEndEvent(task);
  });
}

/**
 * Adds a dragstart event listener to a task.
 * @param {HTMLElement} task - The task element.
 */
function addDragStartEvent(task) {
  task.addEventListener("dragstart", e => {
    selectedTask = e.target;
    setTimeout(() => selectedTask.classList.add("dragging"), 0);
  });
}

/**
 * Adds a dragend event listener to a task.
 * @param {HTMLElement} task - The task element.
 */
function addDragEndEvent(task) {
  task.addEventListener("dragend", () => {
    if (selectedTask) selectedTask.classList.remove("dragging");
    selectedTask = null;
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    checkToDoColumn();
  });
}

/**
 * Adds dragover and drop event listeners to all columns.
 */
function addColumnEventListeners() {
  const cols = document.querySelectorAll(".task-board-container");
  cols.forEach(col => {
    col.addEventListener("dragover", handleDragOver);
    col.addEventListener("drop", handleDrop);
  });
}

/**
 * Handles the dragover event on a column.
 * @param {DragEvent} e - The dragover event.
 */
function handleDragOver(e) {
  e.preventDefault();
  const col = e.currentTarget;
  const after = getDragAfterElement(col, e.clientY);
  if (!after && !col.contains(placeholder)) {
    col.appendChild(placeholder);
  } else if (after && col.contains(after)) {
    col.insertBefore(placeholder, after);
  }
}

/**
 * Handles the drop event on a column.
 * @param {DragEvent} e - The drop event.
 */
function handleDrop(e) {
  e.preventDefault();
  const col = e.currentTarget;
  if (selectedTask) {
    if (col.contains(placeholder)) col.insertBefore(selectedTask, placeholder);
    else col.appendChild(selectedTask);
    selectedTask.classList.remove("dragging");
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    checkToDoColumn();
  }
}

/**
 * Finds the element after which the dragged element should be placed.
 * @param {HTMLElement} container - The container element.
 * @param {number} y - The vertical coordinate.
 * @returns {HTMLElement|undefined} The element after which to place the dragged element.
 */
function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return items.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener("DOMContentLoaded", () => {
  enableDragAndDrop();
  setTimeout(checkToDoColumn, 100);
});
