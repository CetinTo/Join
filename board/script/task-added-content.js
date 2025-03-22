// Code Block 1 (Variables)
/** Placeholder for drag & drop. @type {HTMLElement} */ 
let placeholder = document.createElement("div");
/** Currently dragged task. @type {HTMLElement|null} */ 


// Code Block 2 (checkToDoColumn)
/** Checks "toDoColumn" for tasks; toggles image. */ 
function checkToDoColumn() {
  let toDo = document.getElementById("toDoColumn");
  let img = toDo.querySelector("img");
  if (!img) return;
  let hasTasks = toDo.querySelectorAll(".draggable-cards").length > 0;
  img.style.display = hasTasks ? "none" : "block";
}

// Code Block 3 (checkColumns)
/** Some scripts call checkColumns; just wrap checkToDoColumn. */
function checkColumns() {
  checkToDoColumn();
}

// Code Block 4 (enableDragAndDrop)
/** Sets up drag-and-drop on tasks & columns. */
function enableDragAndDrop() {
  addTaskEventListeners();
  addColumnEventListeners();
}

// Code Block 5 (addTaskEventListeners)
/** Adds dragstart/dragend to tasks. */
function addTaskEventListeners() {
  let tasks = document.querySelectorAll(".draggable-cards");
  tasks.forEach(t => { addDragStartEvent(t); addDragEndEvent(t); });
}

// Code Block 6 (addDragStartEvent)
/** Dragstart event. */
function addDragStartEvent(task) {
  task.addEventListener("dragstart", e => {
    selectedTask = e.target;
    setTimeout(() => selectedTask.classList.add("dragging"), 0);
  });
}

// Code Block 7 (addDragEndEvent)
/** Dragend event. */
function addDragEndEvent(task) {
  task.addEventListener("dragend", () => {
    if (selectedTask) selectedTask.classList.remove("dragging");
    selectedTask = null;
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    checkToDoColumn();
  });
}

// Code Block 8 (addColumnEventListeners)
/** Adds dragover/drop to columns. */
function addColumnEventListeners() {
  let cols = document.querySelectorAll(".task-board-container");
  cols.forEach(c => {
    c.addEventListener("dragover", handleDragOver);
    c.addEventListener("drop", handleDrop);
  });
}

// Code Block 9 (handleDragOver)
/** Manages dragover event. */
function handleDragOver(e) {
  e.preventDefault();
  let col = e.currentTarget;
  let after = getDragAfterElement(col, e.clientY);
  if (!after && !col.contains(placeholder)) col.appendChild(placeholder);
  else if (after && col.contains(after)) col.insertBefore(placeholder, after);
}

// Code Block 10 (handleDrop)
/** Manages drop event. */
function handleDrop(e) {
  e.preventDefault();
  let col = e.currentTarget;
  if (selectedTask) {
    if (col.contains(placeholder)) col.insertBefore(selectedTask, placeholder);
    else col.appendChild(selectedTask);
    selectedTask.classList.remove("dragging");
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    checkToDoColumn();
  }
}

// Code Block 11 (getDragAfterElement)
/** Finds the closest item above pointer. */
function getDragAfterElement(container, y) {
  let items = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return items.reduce((c, child) => {
    let box = child.getBoundingClientRect(), o = y - box.top - box.height / 2;
    if (o < 0 && o > c.offset) return { offset: o, element: child };
    else return c;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Code Block 12 (DOMContentLoaded)
document.addEventListener("DOMContentLoaded", () => {
  enableDragAndDrop();
  setTimeout(checkToDoColumn, 100);
});
