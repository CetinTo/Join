let selectedTask = null;
const dragPlaceholder = document.createElement("div");
dragPlaceholder.classList.add("placeholder-drag");

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

function checkColumns() {
  let columns = document.querySelectorAll(".task-board-container");
  columns.forEach(column => {
    let imgElement = column.querySelector(".empty-state-img");
    let hasTasks = column.querySelectorAll(".draggable-cards").length > 0;
    if (imgElement) {
      imgElement.style.display = hasTasks ? "none" : "block";
    }
  });
}

function initializeDragAndDrop() {
  let tasks = document.querySelectorAll(".draggable-cards");
  let columns = document.querySelectorAll(".task-board-container");

  tasks.forEach(task => {
    task.addEventListener("dragstart", function (e) {
      selectedTask = e.target;
      setTimeout(() => {
        selectedTask.classList.add("dragging");
        selectedTask.style.transform = "rotate(5deg) scale(1.05)";
      }, 0);
    });

    task.addEventListener("dragend", function () {
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
  });

  columns.forEach(column => {
    column.addEventListener("dragover", function (e) {
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

    column.addEventListener("drop", function (e) {
      e.preventDefault();
      if (selectedTask) {
        if (column.contains(dragPlaceholder)) {
          column.insertBefore(selectedTask, dragPlaceholder);
        } else {
          column.appendChild(selectedTask);
        }
        selectedTask.classList.remove("dragging");
        selectedTask.style.transform = "rotate(0deg) scale(1)";
        const taskId = selectedTask.id;
        updateTaskColumnInFirebase(taskId, column.id);
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
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener("DOMContentLoaded", () => {
  ensureEmptyStateImages();
  initializeDragAndDrop();
});
