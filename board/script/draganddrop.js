let selectedTask = null;
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("placeholder-drag");

function ensureEmptyStateImages() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    let hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (!hasTasks && !column.querySelector(".empty-state-img")) {
      let img = document.createElement("img");
      img.src = "../img/no-tasks-to-do.png";  // Passe den Pfad ggf. an
      img.alt = "no tasks to do";
      img.classList.add("empty-state-img");
      column.appendChild(img);
    }
  });
  checkColumns();
}

function checkColumns() {
  document.querySelectorAll(".task-board-container").forEach(column => {
    let imgElement = column.querySelector(".empty-state-img");
    let hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (imgElement) {
      imgElement.style.display = hasTasks ? "none" : "block";
    }
  });
}

function initializeDragAndDrop() {
  const tasks = document.querySelectorAll(".draggable-cards");
  const columns = document.querySelectorAll(".task-board-container");

  tasks.forEach(task => {
    // --- Desktop Drag & Drop ---
    task.addEventListener("dragstart", (e) => {
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

    // --- Mobile: Long-Tap Drag & Drop (Touch-Events) ---
    let longPressTimeout;
    let isTouchDragging = false;
    let initialTouchX = 0;
    let initialTouchY = 0;
    const moveThreshold = 10; // Pixel, um versehentliche Bewegungen zu ignorieren

    task.addEventListener("touchstart", (e) => {
      initialTouchX = e.touches[0].clientX;
      initialTouchY = e.touches[0].clientY;
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
        console.log("Long-Tap aktiviert");
      }, 500);
    });

    task.addEventListener("touchmove", (e) => {
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
      task.style.left = (touch.clientX - offsetX) + "px";
      task.style.top = (touch.clientY - offsetY) + "px";
      
      columns.forEach(column => {
        const rect = column.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          const afterElement = getDragAfterElement(column, touch.clientY);
          if (!afterElement) {
            if (!column.contains(dragPlaceholder)) {
              column.appendChild(dragPlaceholder);
            }
          } else {
            if (afterElement.parentElement === column) {
              column.insertBefore(dragPlaceholder, afterElement);
            } else {
              column.appendChild(dragPlaceholder);
            }
          }
        }
      });
    });

    task.addEventListener("touchend", (e) => {
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
    });

    task.addEventListener("touchcancel", () => {
      clearTimeout(longPressTimeout);
      isTouchDragging = false;
    });
  });

  // Desktop: Dragover & Drop-Events für Spalten
  columns.forEach(column => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(column, e.clientY);
      if (!afterElement) {
        if (!column.contains(dragPlaceholder)) {
          column.appendChild(dragPlaceholder);
        }
      } else {
        if (afterElement.parentElement === column) {
          column.insertBefore(dragPlaceholder, afterElement);
        } else {
          column.appendChild(dragPlaceholder);
        }
      }
    });

    column.addEventListener("drop", (e) => {
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
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".draggable-cards:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener("DOMContentLoaded", () => {
  ensureEmptyStateImages();
  initializeDragAndDrop();
});