let tasks = [];

function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

function getRandomColor() {
  const colors = ["red", "green", "blue", "pink", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function enrichTasksWithUserData(tasks) {
  tasks.forEach(task => {
    if (!task.users) return;
    task.users.forEach(user => {
      if (!user.initials) user.initials = getInitials(user.name);
      if (!user.color) user.color = getRandomColor();
    });
  });
}

function extractPriority(iconPath) {
  if (!iconPath) return 'medium';
  const lower = iconPath.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}

async function loadTasksFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fehler beim Laden");
    let data = await response.json();
    if (!data || typeof data !== "object") return [];
    let tasksArray = Object.entries(data)
      .filter(([key]) => key !== "null" && key !== "task-3")
      .map(([key, value]) => ({ firebaseKey: key, ...value }));
    enrichTasksWithUserData(tasksArray);
    return tasksArray;
  } catch (error) {
    return [];
  }
}

async function updateTaskColumnInFirebase(taskId, newColumn) {
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: newColumn })
    });
    if (!response.ok) {
      throw new Error(`Fehler beim Updaten der Task-Spalte: ${response.statusText}`);
    }
  } catch (error) {}
}

function generateTasks(tasksData) {
  tasksData.forEach(task => {
    if (!task || !task.title || !task.column) return;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const priorityMapping = {
      "urgent": "../img/icon-urgent.png",
      "medium": "../img/priority-img/medium.png",
      "low": "../img/icon-low.png"
    };
    let extractedPriority = extractPriority(task.priority);
    if (!priorityMapping[extractedPriority]) extractedPriority = "medium";
    const taskPriority = priorityMapping[extractedPriority];
    const taskElement = document.createElement("div");
    taskElement.classList.add("draggable-cards");
    taskElement.setAttribute("id", task.firebaseKey || task.id);
    taskElement.setAttribute("draggable", "true");
    taskElement.dataset.title = task.title.toLowerCase();
    taskElement.dataset.description = task.description.toLowerCase();
    taskElement.innerHTML = `
      <div class="card-label-${task.category === "Technical task" ? "technical-task" : "user-story"} padding-left">
          <h4>${task.category === "Technical task" ? "Technical Task" : "User Story"}</h4>
      </div>
      <div>
          <h5 class="card-label-user-story-h5 padding-left">${task.title}</h5>
      </div>
      <div>
          <h6 class="card-label-user-story-h6 padding-left">${task.description}</h6>
      </div>
      <div class="task-progress">
          <div class="progress-main-container">
              <div class="progress-container">
                  <div class="progress-bar" style="width: ${progressPercent}%;"></div>
              </div>
          </div>
          <span class="progress-text">${completedSubtasks} / ${totalSubtasks} tasks</span>
      </div>
      <div class="card-footer">
          <div class="padding-left profile-badge-container">
              ${task.users ? task.users.map(user => `<div class="profile-badge-floating-${user.color}">${user.initials}</div>`).join("") : ""}
          </div>
          <div class="priority-container-img">
              <img src="${taskPriority}" alt="Priority" onerror="this.src='../img/priority-img/medium.png'" class="priority-container-img">
          </div>
      </div>
    `;
    const column = document.getElementById(task.column);
    if (column) column.appendChild(taskElement);
    taskElement.addEventListener("click", () => openTaskModal(task));
    taskElement.addEventListener("dragend", async function () {
      const newColumn = taskElement.closest(".task-board-container")?.id;
      if (!newColumn) return;
      await updateTaskColumnInFirebase(taskElement.id, newColumn);
    });
  });
  checkColumns();
}

function filterTasks(searchTerm) {
  const tasksElements = document.querySelectorAll(".draggable-cards");
  let found = false;
  tasksElements.forEach(task => {
    const title = task.dataset.title || "";
    const description = task.dataset.description || "";
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      task.style.display = "flex";
      found = true;
    } else {
      task.style.display = "none";
    }
  });
  document.getElementById("errorTaskFound").style.display = found ? "none" : "block";
}

function getPriorityLabel(iconPath) {
  if (!iconPath) return "Unknown";
  if (iconPath.includes("urgent")) return "Urgent";
  if (iconPath.includes("medium")) return "Medium";
  if (iconPath.includes("low")) return "Low";
  return "Unknown";
}

function checkToDoColumn() {
  let toDoColumn = document.getElementById("toDoColumn");
  let imgElement = toDoColumn.querySelector("img");
  if (!imgElement) return;
  let hasTasks = toDoColumn.querySelectorAll(".draggable-cards").length > 0;
  imgElement.style.display = hasTasks ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", async () => {
  tasks = await loadTasksFromFirebase();
  generateTasks(tasks);
  enableDragAndDrop();
  checkToDoColumn();
  document.getElementById("searchInput").addEventListener("input", function () {
    filterTasks(this.value.trim().toLowerCase());
  });
});

function updateSubtaskStatus(taskId, subtaskIndex, newStatus) {
  if (!currentTask || currentTaskId !== taskId) {
    return;
  }
  currentTask.subtasks[subtaskIndex].completed = newStatus;
  const total = currentTask.subtasks.length;
  const completed = currentTask.subtasks.filter(st => st.completed).length;
  const newProgress = total > 0 ? (completed / total) * 100 : 0;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtasks: currentTask.subtasks,
      progress: newProgress
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error("Fehler beim Aktualisieren des Subtask-Status.");
    }
  }).catch(error => {});
}

function closeModalAndReload() {
  const modal = document.getElementById('toggleModalFloating');
  if (modal) {
    modal.style.display = 'none';
  }
  location.reload();
}

function openTaskModal(task) {
  currentTask = task;
  currentTaskId = task.firebaseKey || task.id;
  const modal = document.getElementById('toggleModalFloating');
  modal.dataset.taskId = currentTaskId;
  const categoryContainer = modal.querySelector('.main-section-task-overlay > div:first-child');
  categoryContainer.className = `card-label-${task.category.toLowerCase().includes('technical') ? 'technical-task' : 'user-story'}-modal w445`;
  categoryContainer.querySelector('h4').textContent = task.category;
  document.getElementById('modalTitle').innerText = task.title || "Kein Titel";
  document.getElementById('modalDescription').innerText = task.description || "Keine Beschreibung";
  document.getElementById('modalDueDate').innerText = task.dueDate || "Kein Datum";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
  const assignedContainer = document.getElementById('modalAssignedTo');
  assignedContainer.innerHTML = task.users.map(user => `
    <div class="flexrow profile-names">
      <div class="profile-badge-floating-${user.color || 'gray'}">${user.initials || '?'}</div>
      <span class="account-name">${user.name || 'Unbekannt'}</span>
    </div>
  `).join("");
  const modalSubtasks = document.getElementById("modalSubtasks");
  modalSubtasks.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((st, index) => {
      const stDiv = document.createElement("div");
      stDiv.classList.add("subtask-container-div-item");
      stDiv.innerHTML = `
        <div class="flexrow">
          <input type="checkbox" class="subtask-checkbox" data-index="${index}" ${st.completed ? "checked" : ""}>
          <span>${st.text}</span>
        </div>
      `;
      modalSubtasks.appendChild(stDiv);
    });
    modalSubtasks.querySelectorAll(".subtask-checkbox").forEach(checkbox => {
      checkbox.addEventListener("change", function () {
        const subtaskIndex = parseInt(this.getAttribute("data-index"), 10);
        const newStatus = this.checked;
        updateSubtaskStatus(currentTaskId, subtaskIndex, newStatus);
      });
    });
  }
  modal.style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", function() {
  const floatingModal = document.getElementById('toggleModalFloating');
  const modalContent = document.querySelector('.main-section-task-overlay');
  if (floatingModal && modalContent) {
    floatingModal.addEventListener('click', function(event) {
      if (event.target === floatingModal) {
        floatingModal.style.display = 'none';
        location.reload();
      }
    });
    modalContent.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
});

function reloadPage() {
  location.reload();
}
