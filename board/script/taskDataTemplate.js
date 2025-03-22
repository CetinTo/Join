/**
 * Globale Variablen, um aktuelle Task-Informationen zu speichern.
 * (Da openTaskModal und updateSubtaskStatus darauf zugreifen, 
 * legen wir sie hier im globalen Scope ab.)
 */
window.currentTask = null;
window.currentTaskId = null;

/**
 * Aktualisiert den Status eines Subtasks und passt den Fortschritt der Aufgabe an.
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index des zu aktualisierenden Subtasks.
 * @param {boolean} newStatus - Der neue Status des Subtasks (true, wenn abgeschlossen).
 */
function updateSubtaskStatus(taskId, subtaskIndex, newStatus) {
  if (!window.currentTask || window.currentTaskId !== taskId) {
    return;
  }
  window.currentTask.subtasks[subtaskIndex].completed = newStatus;
  const total = window.currentTask.subtasks.length;
  const completed = window.currentTask.subtasks.filter(st => st.completed).length;
  const newProgress = total > 0 ? (completed / total) * 100 : 0;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtasks: window.currentTask.subtasks,
      progress: newProgress
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error("Fehler beim Aktualisieren des Subtask-Status.");
    }
  }).catch(error => {});
}

/**
 * Liefert ein textuelles Label basierend auf dem Icon-Pfad der Priorität.
 * @param {string} iconPath - Der Pfad des Prioritätsicons.
 * @returns {string} Das Prioritätslabel (z. B. "Urgent", "Medium", "Low").
 */
function getPriorityLabel(iconPath) {
  if (!iconPath) return "Unknown";
  if (iconPath.includes("urgent")) return "Urgent";
  if (iconPath.includes("medium")) return "Medium";
  if (iconPath.includes("low")) return "Low";
  return "Unknown";
}

/**
 * Öffnet das Task-Modal und befüllt es mit den Details der ausgewählten Aufgabe.
 * @param {Object} task - Das Aufgabenobjekt, dessen Details angezeigt werden sollen.
 */
function openTaskModal(task) {
  window.currentTask = task;
  window.currentTaskId = task.firebaseKey || task.id;
  const modal = document.getElementById('toggleModalFloating');
  modal.dataset.taskId = window.currentTaskId;
  const categoryContainer = modal.querySelector('.main-section-task-overlay > div:first-child');
  categoryContainer.className = `card-label-${
    task.category.toLowerCase().includes('technical') ? 'technical-task' : 'user-story'
  }-modal w445`;
  categoryContainer.querySelector('h4').textContent = task.category;
  document.getElementById('modalTitle').innerText = task.title || "Kein Titel";
  document.getElementById('modalDescription').innerText = task.description || "Keine Beschreibung";
  document.getElementById('modalDueDate').innerText = task.dueDate || "Kein Datum";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
  const assignedContainer = document.getElementById('modalAssignedTo');
  assignedContainer.innerHTML = task.users
    .map(user => `
      <div class="flexrow profile-names">
        <div class="profile-badge-floating-${user.color || 'gray'}">${user.initials || '?'}</div>
        <span class="account-name">${user.name || 'Unbekannt'}</span>
      </div>
    `)
    .join("");
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
        updateSubtaskStatus(window.currentTaskId, subtaskIndex, newStatus);
      });
    });
  }
  modal.style.display = 'flex';
}

/**
 * Extrahiert die Priorität aus einem gegebenen Icon-Pfad.
 * Wenn der Pfad "urgent", "medium" oder "low" enthält, wird die entsprechende Priorität zurückgegeben.
 * Standardmäßig wird "medium" zurückgegeben.
 * @param {string} iconPath - Der Pfad des Prioritätsicons.
 * @returns {string} Die extrahierte Priorität.
 */
function extractPriority(iconPath) {
  if (!iconPath) return 'medium';
  const lower = iconPath.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}

/**
 * Aktualisiert die Spalte einer Aufgabe in Firebase.
 * @async
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {string} newColumn - Die neue Spalte, in die die Aufgabe verschoben werden soll.
 * @returns {Promise<void>} Ein Promise, das resolved, wenn die Aktualisierung abgeschlossen ist.
 */
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
  } catch (error) {
    // Fehlerbehandlung (optional)
  }
}

/**
 * Überprüft alle Spalten, die als Container für Tasks dienen.
 * Es wird davon ausgegangen, dass jede Spalte die Klasse "task-board-container" hat
 * und ein <img>-Element als Platzhalter enthält, welches ausgeblendet wird, wenn Tasks vorhanden sind.
 */
function checkColumns() {
  const columns = document.querySelectorAll('.task-board-container');
  columns.forEach(column => {
    const imgElement = column.querySelector('img');
    if (!imgElement) return;
    const hasTasks = column.querySelectorAll('.draggable-cards').length > 0;
    imgElement.style.display = hasTasks ? 'none' : 'block';
  });
}

/**
 * Generiert DOM-Elemente für jede Aufgabe und fügt sie der entsprechenden Spalte hinzu.
 * Fügt außerdem Event-Listener zum Öffnen des Task-Modals und zum Aktualisieren der Spalte nach Drag & Drop hinzu.
 * 
 * @param {Array<Object>} tasksData - Array von Aufgabenobjekten.
 */
function generateTasks(tasksData) {
  tasksData.forEach(task => {
    if (!task || !task.title || !task.column) return;

    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const priorityMapping = {
      urgent: "../img/icon-urgent.png",
      medium: "../img/priority-img/medium.png",
      low: "../img/icon-low.png"
    };
    let extractedPrio = extractPriority(task.priority);
    if (!priorityMapping[extractedPrio]) extractedPrio = "medium";
    const taskPriority = priorityMapping[extractedPrio];

    const taskElement = document.createElement("div");
    taskElement.classList.add("draggable-cards");
    taskElement.setAttribute("id", task.firebaseKey || task.id);
    taskElement.setAttribute("draggable", "true");
    taskElement.dataset.title = task.title.toLowerCase();
    taskElement.dataset.description = task.description.toLowerCase();

    taskElement.innerHTML = `
      <div class="card-label-${task.category === "Technical task" ? "technical-task" : "user-story"} padding-left">
          <h4>${task.category === "Technical task" ? "Technical Task" : "User Story"}</h4>
          <img src="../img/drag-drop-icon.png" alt="drag-and-drop-icon" class="drag-drop-icon">
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
              ${
                task.users
                  ? task.users
                      .map(
                        user => `<div class="profile-badge-floating-${user.color}">${user.initials}</div>`
                      )
                      .join("")
                  : ""
              }
          </div>
          <div class="priority-container-img">
              <img src="${taskPriority}" alt="Priority" onerror="this.src='../img/priority-img/medium.png'" class="priority-container-img">
          </div>
      </div>
    `;

    const column = document.getElementById(task.column);
    if (column) column.appendChild(taskElement);

    // Öffnet das Task-Modal, wenn auf die Karte geklickt wird.
    taskElement.addEventListener("click", () => openTaskModal(task));

    // Zusätzlich wird bei Drag-End das Update der Spalte durchgeführt.
    taskElement.addEventListener("dragend", async function () {
      const newColumn = taskElement.closest(".task-board-container")?.id;
      if (!newColumn) return;
      await updateTaskColumnInFirebase(taskElement.id, newColumn);
    });

    // Event-Listener für das Drag-Drop-Icon, um das Dropdown-Menü anzuzeigen.
    const dragDropIcon = taskElement.querySelector('.drag-drop-icon');
    if (dragDropIcon) {
      dragDropIcon.addEventListener("click", function(e) {
        e.stopPropagation();
        let dropdown = taskElement.querySelector(".move-to-dropdown");
        if (dropdown) {
          dropdown.classList.toggle("visible");
        } else {
          dropdown = document.createElement("div");
          dropdown.classList.add("move-to-dropdown");
          dropdown.innerHTML = `
            <div class="dropdown-header">Move To</div>
            <div class="dropdown-option" data-status="toDoColumn">To do</div>
            <div class="dropdown-option" data-status="inProgress">In Progress</div>
            <div class="dropdown-option" data-status="awaitFeedback">await feedback</div>
            <div class="dropdown-option" data-status="done">Done</div>
          `;
          taskElement.appendChild(dropdown);
          dropdown.classList.add("visible");

          dropdown.querySelectorAll(".dropdown-option").forEach(option => {
            option.addEventListener("click", async function(ev) {
              ev.stopPropagation();
              const newStatus = option.dataset.status;
              console.log(`Task ${taskElement.id} verschieben nach: ${newStatus}`);
              await updateTaskColumnInFirebase(taskElement.id, newStatus);
              const newColumn = document.getElementById(newStatus);
              if (newColumn) {
                newColumn.appendChild(taskElement);
              }
              dropdown.classList.remove("visible");
              checkColumns();
            });
          });
        }
      });
    }
  });
  // Nach dem Erstellen der Tasks alle Spalten prüfen
  checkColumns();
}

// Exportiere alle benötigten Funktionen
export {
  generateTasks,
  openTaskModal,
  updateTaskColumnInFirebase,
  updateSubtaskStatus,
  getPriorityLabel,
  checkColumns
};
