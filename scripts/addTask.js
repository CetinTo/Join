/**
 * @fileoverview Binds all relevant event listeners and initializes the form once the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  initCreateBtnEventListener();
  initAddSubtaskBtnEventListener();
  initFormInputEventListeners();
  initAssignedContainerObserver();
  initPriorityEventListeners();
  initCategoryEventListeners();
  initSubtaskDeleteEventListener();
  validateForm();
});

/**
 * @function initCreateBtnEventListener
 * @description Attaches a click event listener to the "Create" button, triggering task creation.
 * @returns {void}
 */
function initCreateBtnEventListener() {
  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", handleTaskCreation);
  }
}

/**
 * @function initAddSubtaskBtnEventListener
 * @description Attaches a click event listener to the "Add Subtask" button, triggering subtask addition.
 * @returns {void}
 */
function initAddSubtaskBtnEventListener() {
  const addSubtaskBtn = document.querySelector(".add-subtask-btn");
  if (addSubtaskBtn) {
    addSubtaskBtn.addEventListener("click", addSubtask);
  }
}

/**
 * @function initFormInputEventListeners
 * @description Adds 'input' event listeners to various form fields to validate the form in real-time.
 * @returns {void}
 */
function initFormInputEventListeners() {
  [".input", ".description", ".date-input", ".select-task", ".subtask"]
    .forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.addEventListener("input", validateForm);
    });
}

/**
 * @function initAssignedContainerObserver
 * @description Observes the assigned-to container for changes to dynamically validate the form.
 * @returns {void}
 */
function initAssignedContainerObserver() {
  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  if (assignedContainer) {
    new MutationObserver(validateForm)
      .observe(assignedContainer, { childList: true });
  }
}

/**
 * @function initPriorityEventListeners
 * @description Attaches click events to priority options, allowing selection and validation updates.
 * @returns {void}
 */
function initPriorityEventListeners() {
  document.querySelectorAll(".priority-container div")
    .forEach(option => {
      option.addEventListener("click", function() {
        document.querySelectorAll(".priority-container div")
          .forEach(o => o.classList.remove("active"));
        this.classList.add("active");
        validateForm();
      });
    });
}

/**
 * @function initCategoryEventListeners
 * @description Attaches click events to category items to toggle selection and update validation.
 * @returns {void}
 */
function initCategoryEventListeners() {
  document.querySelectorAll(".category-item")
    .forEach(item => {
      item.addEventListener("click", function() {
        document.querySelectorAll(".category-item")
          .forEach(i => i.classList.remove("selected"));
        this.classList.add("selected");
        document.querySelector(".category-selected").textContent = this.textContent;
        validateForm();
      });
    });
}

/**
 * @function initSubtaskDeleteEventListener
 * @description Attaches a click event to the subtasks container to handle subtask deletion.
 * @returns {void}
 */
function initSubtaskDeleteEventListener() {
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (subtasksContainer) {
    subtasksContainer.addEventListener("click", e => {
      if (e.target.classList.contains("delete-icon")) {
        e.target.parentElement.remove();
        validateForm();
      }
    });
  }
}

/**
 * Creates a new subtask and appends it to the subtask container.
 * @returns {void}
 */
function addSubtask() {
  const text = getMainInputText();
  if (!text) return;
  const subtaskItem = createSubtaskElement(text);
  appendSubtask(subtaskItem);
  validateForm();
}

/**
 * Retrieves the trimmed text from the main input field.
 * @returns {string|null} The trimmed text, or null if the input is not found.
 */
function getMainInputText() {
  const mainInput = document.querySelector(".input");
  return mainInput ? mainInput.value.trim() : null;
}

/**
 * Creates a subtask element with the given text.
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The created subtask element.
 */
function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("added-subtasks");
  const span = document.createElement("span");
  span.innerText = text;
  const deleteIcon = document.createElement("span");
  deleteIcon.classList.add("delete-icon");
  deleteIcon.innerText = "✕";
  subtaskItem.appendChild(span);
  subtaskItem.appendChild(deleteIcon);
  return subtaskItem;
}

/**
 * Appends the subtask element to the subtask container.
 * @param {HTMLElement} subtaskItem - The subtask element to append.
 */
function appendSubtask(subtaskItem) {
  const container = document.querySelector(".subtasks-scroll-container");
  if (container) {
    container.appendChild(subtaskItem);
  }
}


/**
 * @function handleTaskCreation
 * @description Validates the form and, if valid, initiates task creation in Firebase.
 * @returns {Promise<void>}
 */
async function handleTaskCreation() {
  if (!validateForm()) return;
  const createBtn = document.querySelector(".create-btn");
  createBtn.disabled = true;
  try {
    await addTaskToFirebase();
  } finally {
    createBtn.disabled = false;
  }
}

/** 
 * @type {boolean} Indicates if a task creation request is currently in progress.
 */
let isSaving = false;

/**
 * Creates a task object based on current form inputs.
 * @param {string} mainInputValue - The trimmed main input value.
 * @returns {object} The task data object.
 */
function getTaskData(mainInputValue) {
  const description = document.querySelector(".description").value.trim() || "No description provided";
  const dueDate = document.querySelector(".date-input").value;
  const priority = `../../img/priority-img/${
    document.querySelector(".priority-container .active")?.dataset.priority || "low"
  }.png`;
  const users = [...document.querySelectorAll(".assigned-to-profiles-container div")].map(
    user => ({ name: user.innerText.trim() })
  );
  const subtasks = [...document.querySelectorAll(".subtasks-scroll-container .added-subtasks")].map(
    () => ({ completed: false, text: mainInputValue })
  );
  const category = document.querySelector(".category-item.selected")?.dataset.value || "Technical task";
  return { column: "toDoColumn", description, dueDate, id: null, priority, title: mainInputValue, users, subtasks, category };
}

/**
 * Sends a POST request to Firebase to create a new task.
 * @param {object} taskData - The task data object.
 * @returns {Promise<string>} The Firebase-generated ID for the task.
 */
async function postTaskData(taskData) {
  const response = await fetch(
    "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    }
  );
  return (await response.json()).name;
}

/**
 * Updates the task record in Firebase with its new ID.
 * @param {string} firebaseId - The Firebase-generated ID.
 * @returns {Promise<void>}
 */
async function updateTaskId(firebaseId) {
  await fetch(
    `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${firebaseId}/id.json`,
    {
      method: "PUT",
      body: JSON.stringify(firebaseId)
    }
  );
}

/**
 * Adds a new task to Firebase by creating the task data, posting it, updating the record,
 * clearing the form, and redirecting to the board page.
 * @returns {Promise<void>}
 */
async function addTaskToFirebase() {
  if (isSaving) return;
  isSaving = true;
  const mainInputValue = document.querySelector(".input").value.trim();
  const taskData = getTaskData(mainInputValue);
  try {
    const firebaseId = await postTaskData(taskData);
    await updateTaskId(firebaseId);
    clearForm();
    window.location.href = "./board.html";
  } finally {
    isSaving = false;
  }
}



/**
 * Validates the form by checking all required fields and updating the "Create" button state.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function validateForm() {
  const isValid = checkRequiredFields();
  updateCreateButtonState(isValid);
  return isValid;
}

/**
 * Checks if all required fields are filled.
 * @returns {boolean} True if all required fields are valid, otherwise false.
 */
function checkRequiredFields() {
  return [
    !!document.querySelector(".input").value.trim(),
    !!document.querySelector(".date-input").value,
    document.querySelectorAll(".assigned-to-profiles-container div").length > 0,
    Boolean(document.querySelector(".priority-container .active")),
    Boolean(document.querySelector(".category-item.selected")),
  ].every(Boolean);
}

/**
 * Updates the "Create" button's appearance and interactivity based on form validity.
 * @param {boolean} isValid - True if the form is valid.
 */
function updateCreateButtonState(isValid) {
  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.classList.toggle("disabled", !isValid);
    createBtn.style.pointerEvents = isValid ? "auto" : "none";
    createBtn.style.opacity = isValid ? "1" : "0.5";
  }
}


/**
 * @function clearForm
 * @description Resets all form fields and removes dynamically added subtasks and assigned user elements.
 * @returns {void}
 */
function clearForm() {
  document.querySelector(".input").value = "";
  document.querySelector(".description").value = "";
  document.querySelector(".date-input").value = "";
  document.querySelector(".subtask").value = "";
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
  document.querySelectorAll(".added-subtasks").forEach(item => item.remove());
}