// ------------------------------
// GLOBAL VARIABLES
// ------------------------------
/**
 * Aktuelle Task, auf die zugegriffen wird.
 * @global
 * @type {Object|null}
 */
window.currentTask = null;
/**
 * ID der aktuellen Task.
 * @global
 * @type {string|null}
 */
window.currentTaskId = null;

// ------------------------------
// SUBTASK & PRIORITY HANDLING
// ------------------------------

/**
 * Aktualisiert den Status eines Subtasks und passt den Fortschritt an.
 * @param {string} taskId - ID der Aufgabe.
 * @param {number} subtaskIndex - Index des Subtasks.
 * @param {boolean} newStatus - Neuer Status (true = abgeschlossen).
 */
function updateSubtaskStatus(taskId, subtaskIndex, newStatus) {
  if (!window.currentTask || window.currentTaskId !== taskId) return;
  window.currentTask.subtasks[subtaskIndex].completed = newStatus;
  const total = window.currentTask.subtasks.length,
        completed = window.currentTask.subtasks.filter(st => st.completed).length,
        newProgress = total ? (completed / total) * 100 : 0;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtasks: window.currentTask.subtasks, progress: newProgress })
  })
  .then(r => { if (!r.ok) throw new Error("Fehler beim Aktualisieren des Subtask-Status."); })
  .catch(err => {});
}

/**
 * Gibt ein textuelles Label zur Priorität anhand des Icon-Pfads zurück.
 * @param {string} iconPath - Pfad des Prioritätsicons.
 * @returns {string} "Urgent", "Medium", "Low" oder "Unknown".
 */
function getPriorityLabel(iconPath) {
  if (!iconPath) return "Unknown";
  if (iconPath.includes("urgent")) return "Urgent";
  if (iconPath.includes("medium")) return "Medium";
  if (iconPath.includes("low")) return "Low";
  return "Unknown";
}

/**
 * Extrahiert aus dem Icon-Pfad die Priorität.
 * @param {string} iconPath - Pfad des Prioritätsicons.
 * @returns {string} "urgent", "medium" oder "low" (Standard: "medium").
 */
function extractPriority(iconPath) {
  if (!iconPath) return 'medium';
  const lower = iconPath.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}

// ------------------------------
// MODAL RENDERING
// ------------------------------

/**
 * Rendert den Header des Task-Modals anhand der Task-Daten.
 * @param {Object} task - Die Task-Daten.
 * @param {HTMLElement} modal - Das Modal-Element.
 */
function renderModalHeader(task, modal) {
  const cat = modal.querySelector('.main-section-task-overlay > div:first-child');
  cat.className = `card-label-${task.category.toLowerCase().includes('technical') ? 'technical-task' : 'user-story'}-modal w445`;
  cat.querySelector('h4').textContent = task.category;
  document.getElementById('modalTitle').innerText = task.title || "Kein Titel";
  document.getElementById('modalDescription').innerText = task.description || "Keine Beschreibung";
  document.getElementById('modalDueDate').innerText = task.dueDate || "Kein Datum";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
  const assign = document.getElementById('modalAssignedTo');
  assign.innerHTML = task.users.map(u =>
    `<div class="flexrow profile-names">
       <div class="profile-badge-floating-${u.color || 'gray'}">${u.initials || '?'}</div>
       <span class="account-name">${u.name || 'Unbekannt'}</span>
     </div>`
  ).join("");
}

/**
 * Rendert die Subtasks im Task-Modal.
 * @param {Object} task - Die Task-Daten.
 */
function renderSubtasks(task) {
  const ms = document.getElementById("modalSubtasks");
  ms.innerHTML = "";
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((st, i) => {
      const div = document.createElement("div");
      div.classList.add("subtask-container-div-item");
      div.innerHTML = `<div class="flexrow">
                         <input type="checkbox" class="subtask-checkbox" data-index="${i}" ${st.completed ? "checked" : ""}>
                         <span>${st.text}</span>
                       </div>`;
      ms.appendChild(div);
    });
    ms.querySelectorAll(".subtask-checkbox").forEach(cb => {
      cb.addEventListener("change", function () {
        updateSubtaskStatus(window.currentTaskId, parseInt(this.getAttribute("data-index"), 10), this.checked);
      });
    });
  }
}

/**
 * Öffnet das Task-Modal und füllt es mit den Task-Daten.
 * @param {Object} task - Die aufzurufende Task.
 */
function openTaskModal(task) {
  window.currentTask = task;
  window.currentTaskId = task.firebaseKey || task.id;
  const modal = document.getElementById('toggleModalFloating');
  modal.dataset.taskId = window.currentTaskId;
  renderModalHeader(task, modal);
  renderSubtasks(task);
  modal.style.display = 'flex';
}

// ------------------------------
// FIREBASE UPDATE
// ------------------------------

/**
 * Aktualisiert in Firebase die Spalte einer Task.
 * @param {string} taskId - Die ID der Task.
 * @param {string} newColumn - Die neue Spalten-ID.
 * @returns {Promise<void>}
 */
async function updateTaskColumnInFirebase(taskId, newColumn) {
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: newColumn })
    });
    if (!r.ok) throw new Error(`Fehler beim Updaten der Task-Spalte: ${r.statusText}`);
  } catch (e) { }
}

// ------------------------------
// COLUMN CHECK & DRAG & DROP
// ------------------------------

/**
 * Überprüft alle Spalten (Klasse "task-board-container") und blendet
 * das Platzhalterbild ein oder aus, je nachdem ob Tasks vorhanden sind.
 */
function checkColumns() {
  document.querySelectorAll('.task-board-container').forEach(col => {
    const img = col.querySelector('img');
    if (!img) return;
    const hasTasks = col.querySelectorAll('.draggable-cards').length > 0;
    img.style.display = hasTasks ? 'none' : 'block';
  });
}

/**
 * Richtet Drag & Drop ein. Fügt den Karten (Klasse "draggable-cards")
 * Event-Listener für dragstart und dragend hinzu und erlaubt das Ablegen
 * in Spalten (Klasse "task-board-container").
 */
function enableDragAndDrop() {
  document.querySelectorAll('.draggable-cards').forEach(card => {
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll('.task-board-container').forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      const dragCard = document.querySelector('.dragging');
      if (dragCard) col.appendChild(dragCard);
    });
  });
}

// ------------------------------
// TASK ELEMENT CREATION & GENERATION
// ------------------------------

/**
 * Erstellt ein DOM-Element für eine Task.
 * @param {Object} task - Die Task-Daten.
 * @returns {HTMLElement} Das erstellte Task-Element.
 */
function createTaskElement(task) {
  const total = task.subtasks ? task.subtasks.length : 0,
        completed = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0,
        progress = total ? (completed / total) * 100 : 0;
  const mapping = { urgent: "../img/icon-urgent.png", medium: "../img/priority-img/medium.png", low: "../img/icon-low.png" };
  let prio = extractPriority(task.priority); if (!mapping[prio]) prio = "medium";
  const taskPriority = mapping[prio];
  const el = document.createElement("div");
  el.classList.add("draggable-cards");
  el.id = task.firebaseKey || task.id;
  el.setAttribute("draggable", "true");
  el.dataset.title = task.title.toLowerCase();
  el.dataset.description = task.description.toLowerCase();
  el.innerHTML = `
    <div class="card-label-${task.category === "Technical task" ? "technical-task" : "user-story"} padding-left">
      <h4>${task.category === "Technical task" ? "Technical Task" : "User Story"}</h4>
      <img src="../img/drag-drop-icon.png" alt="drag-and-drop-icon" class="drag-drop-icon">
    </div>
    <div><h5 class="card-label-user-story-h5 padding-left">${task.title}</h5></div>
    <div><h6 class="card-label-user-story-h6 padding-left">${task.description}</h6></div>
    <div class="task-progress">
      <div class="progress-main-container">
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
      </div>
      <span class="progress-text">${completed} / ${total} tasks</span>
    </div>
    <div class="card-footer">
      <div class="padding-left profile-badge-container">
        ${task.users ? task.users.map(u => `<div class="profile-badge-floating-${u.color}">${u.initials}</div>`).join("") : ""}
      </div>
      <div class="priority-container-img">
        <img src="${taskPriority}" alt="Priority" onerror="this.src='../img/priority-img/medium.png'" class="priority-container-img">
      </div>
    </div>`;
  return el;
}

/**
 * Generiert alle Task-Elemente und fügt sie in die jeweilige Spalte ein.
 * Richtet außerdem Event-Listener für Modal, Drag & Drop und Dropdown ein.
 * @param {Array<Object>} tasksData - Array von Task-Daten.
 */
function generateTasks(tasksData) {
  tasksData.forEach(task => {
    if (!task || !task.title || !task.column) return;
    const taskEl = createTaskElement(task);
    const col = document.getElementById(task.column);
    if (col) col.appendChild(taskEl);
    taskEl.addEventListener("click", () => openTaskModal(task));
    taskEl.addEventListener("dragend", async function () {
      const newCol = taskEl.closest(".task-board-container")?.id;
      if (newCol) await updateTaskColumnInFirebase(taskEl.id, newCol);
    });
    const ddIcon = taskEl.querySelector('.drag-drop-icon');
    if (ddIcon) {
      ddIcon.addEventListener("click", function(e) {
        e.stopPropagation();
        let dd = taskEl.querySelector(".move-to-dropdown");
        if (dd) dd.classList.toggle("visible");
        else {
          dd = document.createElement("div");
          dd.classList.add("move-to-dropdown");
          dd.innerHTML = `
            <div class="dropdown-header">Move To</div>
            <div class="dropdown-option" data-status="toDoColumn">To do</div>
            <div class="dropdown-option" data-status="inProgress">In Progress</div>
            <div class="dropdown-option" data-status="awaitFeedback">await feedback</div>
            <div class="dropdown-option" data-status="done">Done</div>
          `;
          taskEl.appendChild(dd);
          dd.classList.add("visible");
          dd.querySelectorAll(".dropdown-option").forEach(option => {
            option.addEventListener("click", async function(ev) {
              ev.stopPropagation();
              const ns = option.dataset.status;
              await updateTaskColumnInFirebase(taskEl.id, ns);
              const newCol = document.getElementById(ns);
              if (newCol) newCol.appendChild(taskEl);
              dd.classList.remove("visible");
              checkColumns();
            });
          });
        }
      });
    }
  });
  checkColumns();
}

// ------------------------------
// EXPORTS
// ------------------------------
export {
  generateTasks,
  openTaskModal,
  updateTaskColumnInFirebase,
  updateSubtaskStatus,
  getPriorityLabel,
  checkColumns,
  enableDragAndDrop
};
