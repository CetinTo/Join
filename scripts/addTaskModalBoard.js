document.addEventListener("DOMContentLoaded", initTaskForm);

/**
 * Initializes all components and logic of the task form.
 */
function initTaskForm() {
  bindCreateButton();
  bindInputValidation();
  observeAssignedProfiles();
  bindPrioritySelection();
  bindCategorySelection();
  bindSubtaskManagement();
  validateForm();
}

/**
 * Binds the "Create Task" button and avoids duplicate event listeners.
 */
function bindCreateButton() {
  const btn = getUniqueCreateButton();
  if (!btn) return;
  btn.addEventListener("click", createTaskHandler);
}

/**
 * Finds the current Create button, clones it, and replaces the old one.
 * @returns {HTMLElement|null} The new button or null if not found.
 */
function getUniqueCreateButton() {
  const oldBtn = document.querySelector(".create-btn");
  if (!oldBtn) return null;
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  return newBtn;
}

/**
 * Event handler executed when the Create button is clicked.
 * @param {Event} e - The event object.
 */
async function createTaskHandler(e) {
  const btn = e.currentTarget;
  if (!validateForm()) return;
  btn.disabled = true;
  try {
    await addTaskToFirebase();
  } catch (error) {
    console.error("Task creation failed", error);
  } finally {
    btn.disabled = false;
  }
}

/**
 * Binds all relevant input elements to the validation function.
 */
function bindInputValidation() {
  const selectors = [
    ".input",
    ".date-input",
    ".select-task",
    ".priority-container",
    ".description",
    ".subtask"
  ];
  selectors.forEach(addValidationListener);
}

/**
 * Adds an event listener to the element found by the selector.
 * @param {string} selector - The CSS selector.
 */
function addValidationListener(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const eventType = selector === ".select-task" ? "change" : "input";
    element.addEventListener(eventType, validateForm);
  }
}

/**
 * Observes changes in the assigned profiles container.
 */
function observeAssignedProfiles() {
  const container = document.querySelector(".assigned-to-profiles-container");
  if (container) {
    const observer = new MutationObserver(validateForm);
    observer.observe(container, { childList: true });
  }
}

/**
 * Binds click events to the priority options.
 */
function bindPrioritySelection() {
  const options = document.querySelectorAll(".priority-container div");
  options.forEach(option => {
    option.addEventListener("click", () => {
      removeActiveClass(options);
      option.classList.add("active");
      validateForm();
    });
  });
}

/**
 * Removes the 'active' class from all options.
 * @param {NodeList} options - The list of priority options.
 */
function removeActiveClass(options) {
  options.forEach(o => o.classList.remove("active"));
}

/**
 * Binds click events to category items and synchronizes the selection.
 */
function bindCategorySelection() {
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', () => handleCategorySelection(categoryItems, item));
  });
}

/**
 * Handles the selection of a category item.
 * @param {NodeList} items - All category items.
 * @param {HTMLElement} item - The clicked element.
 */
function handleCategorySelection(items, item) {
  items.forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');
  updateCategoryText(item);
  updateCategorySelect(item);
  validateForm();
}

/**
 * Updates the displayed category text.
 * @param {HTMLElement} item - The selected element.
 */
function updateCategoryText(item) {
  const categoryDisplay = document.querySelector('.category-selected');
  if (categoryDisplay) categoryDisplay.textContent = item.textContent;
}

/**
 * Sets the value of the hidden select element.
 * @param {HTMLElement} item - The selected element.
 */
function updateCategorySelect(item) {
  const select = document.querySelector(".select-task");
  if (select) select.value = item.getAttribute("data-value");
}

/**
 * Binds functions for adding and deleting subtasks.
 */
function bindSubtaskManagement() {
  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (!addSubtaskBtn || !subtaskInput || !subtasksContainer) return;
  addSubtaskBtn.addEventListener("click", () => handleAddSubtask(subtaskInput, subtasksContainer));
  subtasksContainer.addEventListener("click", handleSubtaskDeletion);
}

/**
 * Handles adding a new subtask.
 * @param {HTMLElement} subtaskInput - The input field for subtasks.
 * @param {HTMLElement} container - The container where the subtask is added.
 */
function handleAddSubtask(subtaskInput, container) {
  const text = subtaskInput.value.trim();
  if (text !== "") {
    const newItem = createSubtaskItem(text);
    container.appendChild(newItem);
    subtaskInput.value = "";
    validateForm();
  }
}

/**
 * Creates a new subtask element.
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The newly created subtask element.
 */
function createSubtaskItem(text) {
  const newItem = document.createElement("div");
  newItem.classList.add("subtask-item", "added-subtasks");
  newItem.innerHTML = `
    <span>${text}</span>
    <img src="../img/subtask-delete.png" alt="Delete Subtask" class="subtask-icon delete-icon" />
  `;
  return newItem;
}

/**
 * Event handler for deleting a subtask.
 * @param {Event} e - The event object.
 */
function handleSubtaskDeletion(e) {
  if (e.target.classList.contains("delete-icon")) {
    e.target.parentElement.remove();
    validateForm();
  }
}

/**
 * Sends task data to Firebase.
 */
async function addTaskToFirebase() {
  const firebaseURL = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  const taskData = getTaskData();
  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    const resData = await response.json();
    const firebaseId = resData.name;
    if (!firebaseId) return;
    await updateFirebaseTaskId(firebaseURL, firebaseId);
    clearForm();
    closeModal();
    location.reload();
  } catch (error) {
    console.error("Error while saving task to Firebase", error);
  }
}

/**
 * Constructs the task data object.
 * @returns {Object} The task data object.
 */
function getTaskData() {
  return {
    column: "toDoColumn",
    description: getInputValue(".description", "No description provided"),
    dueDate: getInputValue(".date-input"),
    id: null,
    priority: `../img/priority-img/${getSelectedPriority()}.png`,
    progress: 0,
    title: getInputValue(".input"),
    users: getSelectedUsers(),
    subtasks: getSubtasks(),
    category: getSelectedCategory()
  };
}

/**
 * Updates the task in Firebase with its own ID.
 * @param {string} url - The Firebase URL.
 * @param {string} firebaseId - The ID returned by Firebase.
 */
async function updateFirebaseTaskId(url, firebaseId) {
  const updateURL = url.replace(".json", `/${firebaseId}/id.json`);
  await fetch(updateURL, {
    method: "PUT",
    body: JSON.stringify(firebaseId)
  });
}

/**
 * Gets the trimmed value of an input field.
 * @param {string} selector - The CSS selector of the input field.
 * @param {string} [fallback=""] - A fallback value if nothing is found.
 * @returns {string} The value of the input field.
 */
function getInputValue(selector, fallback = "") {
  return document.querySelector(selector)?.value.trim() || fallback;
}

/**
 * Reads the currently selected priority.
 * @returns {string} The priority value or 'low' as default.
 */
function getSelectedPriority() {
  return document.querySelector(".priority-container .active")?.dataset.priority || "low";
}

/**
 * Retrieves the selected users.
 * @returns {Array} Array of objects with user names.
 */
function getSelectedUsers() {
  return [...document.querySelectorAll(".assigned-to-profiles-container div")]
    .map(user => ({ name: user.innerText.trim() })) || [{ name: "Unassigned" }];
}

/**
 * Reads all existing subtasks.
 * @returns {Array} Array of subtask objects.
 */
function getSubtasks() {
  return [...document.querySelectorAll(".subtasks-scroll-container .subtask-item span")].map(span => ({
    completed: false,
    text: span.innerText.trim()
  }));
}

/**
 * Retrieves the currently selected category.
 * @returns {string} The value of the selected category or a default value.
 */
function getSelectedCategory() {
  const activeItem = document.querySelector(".category-item.selected");
  return activeItem ? activeItem.dataset.value : "Technical task";
}

/**
 * Clears all inputs and removes selected elements.
 */
function clearForm() {
  [".input", ".description", ".date-input", ".select-task", ".subtask"].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.value = "";
  });
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (subtasksContainer) subtasksContainer.innerHTML = "";
}

/**
 * Closes the task modal.
 */
function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.style.display = "none";
}

/**
 * Checks if the task form is valid.
 * @returns {boolean} True if valid, otherwise false.
 */
function isTaskFormValid() {
  const title = getInputValue(".input");
  const dueDate = getInputValue(".date-input");
  const category = document.querySelector(".category-item.selected")?.dataset.value;
  const assignedUsers = document.querySelectorAll(".assigned-to-profiles-container div").length > 0;
  const prioritySelected = !!document.querySelector(".priority-container .active");
  const hasSubtask = document.querySelectorAll(".added-subtasks").length > 0;
  return title && dueDate && category && assignedUsers && prioritySelected && hasSubtask;
}

/**
 * Updates the appearance and interactivity of the Create button.
 * @param {boolean} isValid - Whether the form is valid.
 */
function updateCreateButtonState(isValid) {
  const createBtn = document.querySelector(".create-btn");
  if (!createBtn) return;
  if (isValid) {
    createBtn.classList.remove("disabled");
    createBtn.style.pointerEvents = "auto";
    createBtn.style.opacity = "1";
  } else {
    createBtn.classList.add("disabled");
    createBtn.style.pointerEvents = "none";
    createBtn.style.opacity = "0.5";
  }
}

/**
 * Validates the form and adjusts the status of the Create button.
 * @returns {boolean} True if the form is valid, otherwise false.
 */
function validateForm() {
  const isValid = isTaskFormValid();
  updateCreateButtonState(isValid);
  return isValid;
}