/**
 * @type {HTMLElement|null} Currently selected task element during drag.
 */
// let selectedTask = null;

/**
 * @type {HTMLElement} Placeholder element used during drag-and-drop.
 */
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("placeholder-drag");

/**
 * Adds empty state images to columns with no tasks.
 * Checks each column and appends an image if empty.
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
 * Shows or hides empty state images depending on column content.
 */
function checkColumns() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    const imgElement = column.querySelector(".empty-state-img");
    const hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (imgElement) {
      imgElement.style.display = hasTasks ? "none" : "block";
    }
  });
}

/**
 * Gets the task element after which the dragged item should be inserted.
 * @param {HTMLElement} container - The column container.
 * @param {number} y - Vertical coordinate.
 * @returns {HTMLElement|undefined} Element after which to insert.
 */
function getDragAfterElement(container, y) {
  const draggable = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return draggable.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
  }, { offset: -Infinity }).element;
}

/**
 * Attaches mouse drag events to a task.
 * @param {HTMLElement} task - Task card element.
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
 * Updates the drag placeholder position during touch movement.
 * @param {Touch} touch - Touch point.
 * @param {HTMLElement[]} columns - Array of column containers.
 */
function updateDragPlaceholderForColumns(touch, columns) {
  columns.forEach(column => {
    const rect = column.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      const afterEl = getDragAfterElement(column, touch.clientY);
      if (!afterEl) {
        if (!column.contains(dragPlaceholder)) column.appendChild(dragPlaceholder);
      } else {
        afterEl.parentElement === column
          ? column.insertBefore(dragPlaceholder, afterEl)
          : column.appendChild(dragPlaceholder);
      }
    }
  });
}

/**
 * Attaches touch drag events to a task.
 * @param {HTMLElement} task - Task card.
 * @param {HTMLElement[]} columns - Columns for drop.
 */
function attachTouchDragEvents(task, columns) {
  let longPressTimeout;
  let isTouchDragging = false;
  let initialTouchX = 0;
  let initialTouchY = 0;
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
    }, 500);
  }

  function handleTouchMove(e) {
    const touch = e.touches[0];
    if (!isTouchDragging) {
      const dx = Math.abs(touch.clientX - initialTouchX);
      const dy = Math.abs(touch.clientY - initialTouchY);
      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimeout(longPressTimeout);
        return;
      }
    }
    if (!isTouchDragging) return;
    e.preventDefault();
    const offsetX = parseFloat(task.dataset.offsetX) || 0;
    const offsetY = parseFloat(task.dataset.offsetY) || 0;
    task.style.left = `${touch.clientX - offsetX}px`;
    task.style.top = `${touch.clientY - offsetY}px`;
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
        if (dropTarget.contains(dragPlaceholder)) {
          dropTarget.insertBefore(task, dragPlaceholder);
        } else {
          dropTarget.appendChild(task);
        }
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
 * Attaches dragover event to column.
 * @param {HTMLElement} column - Column element.
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
 * Attaches drop event to column.
 * @param {HTMLElement} column - Column element.
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
    if (dragPlaceholder.parentNode) {
      dragPlaceholder.parentNode.removeChild(dragPlaceholder);
    }
    checkColumns();
  });
}

/**
 * Initializes drag functionality for tasks.
 * @param {NodeListOf<HTMLElement>} tasks - Task elements.
 * @param {NodeListOf<HTMLElement>} columns - Column elements.
 */
function initializeTasks(tasks, columns) {
  tasks.forEach(task => {
    attachDesktopDragEvents(task);
    attachTouchDragEvents(task, Array.from(columns));
  });
}

/**
 * Initializes drag-related events for columns.
 * @param {NodeListOf<HTMLElement>} columns - Column elements.
 */
function initializeColumns(columns) {
  columns.forEach(column => {
    attachColumnDragOverEvent(column);
    attachColumnDropEvent(column);
  });
}

/**
 * Initializes drag and drop behavior.
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