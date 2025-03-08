let placeholder = document.createElement("div");

function checkToDoColumn() {
  let toDoColumn = document.getElementById("toDoColumn");
  let imgElement = toDoColumn.querySelector("img");
  if (!imgElement) return;
  let hasTasks = toDoColumn.querySelectorAll(".draggable-cards").length > 0;
  imgElement.style.display = hasTasks ? "none" : "block";
}

function enableDragAndDrop() {
  let tasks = document.querySelectorAll(".draggable-cards");
  let columns = document.querySelectorAll(".task-board-container");

  tasks.forEach(task => {
    task.addEventListener("dragstart", function(e) {
      selectedTask = e.target;
      setTimeout(() => selectedTask.classList.add("dragging"), 0);
    });

    task.addEventListener("dragend", function() {
      if (selectedTask) {
        selectedTask.classList.remove("dragging");
        selectedTask = null;
      }
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      checkToDoColumn();
    });
  });

  columns.forEach(column => {
    column.addEventListener("dragover", function(e) {
      e.preventDefault();
      const afterElement = getDragAfterElement(column, e.clientY);
      if (afterElement == null) {
        if (!column.contains(placeholder)) {
          column.appendChild(placeholder);
        }
      } else {
        if (column.contains(afterElement)) {
          column.insertBefore(placeholder, afterElement);
        } else {
          column.appendChild(placeholder);
        }
      }
    });

    column.addEventListener("drop", function(e) {
      e.preventDefault();
      if (selectedTask) {
        if (column.contains(placeholder)) {
          column.insertBefore(selectedTask, placeholder);
        } else {
          column.appendChild(selectedTask);
        }
        selectedTask.classList.remove("dragging");
      }
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      checkToDoColumn();
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
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener("DOMContentLoaded", () => {
  enableDragAndDrop();
  setTimeout(checkToDoColumn, 100);
});
