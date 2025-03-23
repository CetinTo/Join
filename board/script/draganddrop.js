/**
 * Drag & Drop module (Clean Code, JSDoc).
 */
let selectedTask = null;
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("placeholder-drag");

/**
 * Adds empty state images if a column has no tasks.
 */
function ensureEmptyStateImages() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    let hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (!hasTasks && !column.querySelector(".empty-state-img")) {
      let img = document.createElement("img");
      img.src = "../img/no-tasks-to-do.png";
      img.alt = "no tasks to do";
      img.classList.add("empty-state-img");
      column.appendChild(img);
    }
  });
  checkColumns();
}

/**
 * Toggles the empty state image in columns based on task presence.
 */
function checkColumns() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    let imgElement = column.querySelector(".empty-state-img");
    let hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (imgElement) { 
      imgElement.style.display = hasTasks ? "none" : "block"; 
    }
  });
}

/**
 * Determines the element after which the dragged element should be inserted.
 * @param {HTMLElement} container 
 * @param {number} y 
 * @returns {HTMLElement|undefined}
 */
function getDragAfterElement(container, y) {
  const draggable = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return draggable.reduce((closest, child) => {
    const box = child.getBoundingClientRect(), offset = y - box.top - box.height / 2;
    return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
  }, { offset: -Infinity }).element;
}

/**
 * Binds desktop drag events to a task element.
 * @param {HTMLElement} task 
 */
function attachDesktopDragEvents(task) {
  task.addEventListener("dragstart", e => {
    selectedTask = e.target;
    setTimeout(() => { 
      selectedTask.classList.add("dragging");
      selectedTask.style.transform = "rotate(5deg) scale(1.05)";
    }, 0);
  });
  task.addEventListener("dragend", () => {
    if (selectedTask) { 
      selectedTask.classList.remove("dragging"); 
      selectedTask.style.transform = "rotate(0deg) scale(1)"; 
      selectedTask = null; 
    }
    if (dragPlaceholder.parentNode) { 
      dragPlaceholder.parentNode.removeChild(dragPlaceholder); 
    }
    checkColumns();
  });
}

/**
 * Updates the drag placeholder for all columns during a touchmove.
 * @param {Touch} touch 
 * @param {HTMLElement[]} columns 
 */
function updateDragPlaceholderForColumns(touch, columns) {
  columns.forEach(column => {
    const rect = column.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      const afterEl = getDragAfterElement(column, touch.clientY);
      if (!afterEl) {
        if (!column.contains(dragPlaceholder))
          column.appendChild(dragPlaceholder);
      } else {
        afterEl.parentElement === column
          ? column.insertBefore(dragPlaceholder, afterEl)
          : column.appendChild(dragPlaceholder);
      }
    }
  });
}

/**
 * Binds touch drag events to a task element by splitting handlers.
 * @param {HTMLElement} task 
 * @param {HTMLElement[]} columns 
 */
function attachTouchDragEvents(task, columns) {
  let longPressTimeout, isTouchDragging = false, initialTouchX = 0, initialTouchY = 0;
  const moveThreshold = 10;
  
  function handleTouchStart(e) {
    const touch = e.touches[0];
    initialTouchX = touch.clientX; 
    initialTouchY = touch.clientY;
    longPressTimeout = setTimeout(() => {
      isTouchDragging = true;
      selectedTask = task;
      task.classList.add("dragging");
      task.style.transform = "rotate(5deg) scale(1.05)";
      task.style.position = "fixed";
      task.style.zIndex = "1000";
      const rect = task.getBoundingClientRect();
      task.dataset.offsetX = (initialTouchX - rect.left).toString();
      task.dataset.offsetY = (initialTouchY - rect.top).toString();
      console.log("Long-Tap activated");
    }, 500);
  }
  
  function handleTouchMove(e) {
    const touch = e.touches[0];
    if (!isTouchDragging) {
      const dx = Math.abs(touch.clientX - initialTouchX),
            dy = Math.abs(touch.clientY - initialTouchY);
      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimeout(longPressTimeout);
        return;
      }
    }
    if (!isTouchDragging) return;
    e.preventDefault();
    const offsetX = parseFloat(task.dataset.offsetX) || 0,
          offsetY = parseFloat(task.dataset.offsetY) || 0;
    task.style.left = (touch.clientX - offsetX) + "px";
    task.style.top = (touch.clientY - offsetY) + "px";
    updateDragPlaceholderForColumns(touch, columns);
  }
  
  function handleTouchEnd(e) {
    clearTimeout(longPressTimeout);
    if (isTouchDragging && selectedTask === task) {
      const touch = e.changedTouches[0];
      let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      while (dropTarget && !dropTarget.classList.contains("task-board-container")) {
        dropTarget = dropTarget.parentElement;
      }
      if (dropTarget) {
        if (dropTarget.contains(dragPlaceholder))
          dropTarget.insertBefore(task, dragPlaceholder);
        else
          dropTarget.appendChild(task);
        updateTaskColumnInFirebase(task.id, dropTarget.id);
      } else { 
        task.style.position = ""; 
      }
      task.classList.remove("dragging");
      task.style.transform = "rotate(0deg) scale(1)";
      task.style.position = "";
      task.style.zIndex = "";
      selectedTask = null;
      isTouchDragging = false;
      if (dragPlaceholder.parentNode) {
        dragPlaceholder.parentNode.removeChild(dragPlaceholder);
      }
      checkColumns();
    }
  }
  
  function handleTouchCancel() {
    clearTimeout(longPressTimeout);
    isTouchDragging = false;
  }
  
  task.addEventListener("touchstart", handleTouchStart);
  task.addEventListener("touchmove", handleTouchMove);
  task.addEventListener("touchend", handleTouchEnd);
  task.addEventListener("touchcancel", handleTouchCancel);
}

/**
 * Attaches the dragover event to a column.
 * @param {HTMLElement} column 
 */
function attachColumnDragOverEvent(column) {
  column.addEventListener("dragover", e => {
    e.preventDefault();
    const afterEl = getDragAfterElement(column, e.clientY);
    if (!afterEl) {
      if (!column.contains(dragPlaceholder))
        column.appendChild(dragPlaceholder);
    } else {
      afterEl.parentElement === column
        ? column.insertBefore(dragPlaceholder, afterEl)
        : column.appendChild(dragPlaceholder);
    }
  });
}

/**
 * Attaches the drop event to a column.
 * @param {HTMLElement} column 
 */
function attachColumnDropEvent(column) {
  column.addEventListener("drop", e => {
    e.preventDefault();
    if (selectedTask) {
      if (column.contains(dragPlaceholder))
        column.insertBefore(selectedTask, dragPlaceholder);
      else
        column.appendChild(selectedTask);
      selectedTask.classList.remove("dragging");
      selectedTask.style.transform = "rotate(0deg) scale(1)";
      updateTaskColumnInFirebase(selectedTask.id, column.id);
    }
    if (dragPlaceholder.parentNode)
      dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    checkColumns();
  });
}

/**
 * Initializes task events.
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
 * Initializes column events.
 * @param {NodeListOf<HTMLElement>} columns 
 */
function initializeColumns(columns) {
  columns.forEach(column => {
    attachColumnDragOverEvent(column);
    attachColumnDropEvent(column);
  });
}

/**
 * Initializes the drag & drop functionality.
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
