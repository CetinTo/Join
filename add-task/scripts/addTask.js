document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", handleTaskCreation);
  }
  
  const inputsToValidate = [".input", ".description", ".date-input", ".select-task", ".subtask"];
  inputsToValidate.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener("input", validateForm);
    }
  });

  const selectTask = document.querySelector(".select-task");
  if (selectTask) {
    selectTask.addEventListener("change", validateForm);
  }

  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  if (assignedContainer) {
    const observer = new MutationObserver(validateForm);
    observer.observe(assignedContainer, { childList: true });
  }

  const priorityOptions = document.querySelectorAll(".priority-container div");
  if (priorityOptions) {
    priorityOptions.forEach(option => {
      option.addEventListener("click", function() {
        priorityOptions.forEach(o => o.classList.remove("active"));
        this.classList.add("active");
        validateForm();
      });
    });
  }

  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      document.querySelector('.category-selected').textContent = this.textContent;
      const originalSelect = document.querySelector(".select-task");
      if (originalSelect) {
        originalSelect.value = this.getAttribute("data-value");
      }
      validateForm();
    });
  });

  validateForm();
});

async function handleTaskCreation() {
  const createBtn = document.querySelector(".create-btn");

  if (validateForm()) {
    createBtn.disabled = true;
    try {
      await addTaskToFirebase();
    } catch (error) {
      
    } finally {
      createBtn.disabled = false;
    }
  }
}

let isSaving = false;

async function addTaskToFirebase() {
  if (isSaving) return;
  isSaving = true;

  const firebaseURL = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";

  let taskData = {
    column: "toDoColumn",
    description: document.querySelector(".description").value.trim() || "No description provided",
    dueDate: document.querySelector(".date-input").value,
    id: null,
    priority: `../../img/priority-img/${getSelectedPriority()}.png`,
    progress: 0,
    title: document.querySelector(".input").value.trim(),
    users: getSelectedUsers(),
    subtasks: getSubtasks(),
    category: getSelectedCategory()
  };

  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    
    const firebaseId = (await response.json()).name;
    
    await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${firebaseId}/id.json`, {
      method: "PUT",
      body: JSON.stringify(firebaseId)
    });
    
    clearForm();
  } catch (error) {
  
  } finally {
    isSaving = false;
  }
}

function getSelectedPriority() {
  return document.querySelector(".priority-container .active")?.dataset.priority || "low";
}

function getSelectedUsers() {
  return [...document.querySelectorAll(".assigned-to-profiles-container div")]
    .map(user => ({ name: user.innerText.trim() })) || [{ name: "Unassigned" }];
}

function getSubtasks() {
  const items = document.querySelectorAll(".subtasks-scroll-container .subtask-item");
  const subtaskArray = [];
  items.forEach(item => {
    const textEl = item.querySelector("span");
    if (textEl) {
      subtaskArray.push({
        completed: false,
        text: textEl.innerText.trim()
      });
    }
  });
  return subtaskArray;
}

function getSelectedCategory() {
  const activeItem = document.querySelector('.category-item.selected');
  return activeItem ? activeItem.dataset.value : "Technical task";
}

function clearForm() {
  document.querySelector(".input").value = "";
  document.querySelector(".description").value = "";
  document.querySelector(".date-input").value = "";
  document.querySelector(".select-task").value = "";
  document.querySelector(".subtask").value = "";
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
}

function validateForm() {
  const hasTitle = document.querySelector(".input").value.trim().length > 0;
  const hasDate = document.querySelector(".date-input").value.trim().length > 0;
  const hasAssignedUsers = document.querySelectorAll(".assigned-to-profiles-container div").length > 0;
  const hasPriority = document.querySelector(".priority-container .active") !== null;
  const hasAtLeastOneSubtask = document.querySelectorAll(".added-subtasks").length > 0;

  const isFormValid = [
    hasTitle,
    hasDate,
    hasAssignedUsers,
    hasPriority,
    hasAtLeastOneSubtask
  ].every(Boolean);

  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.classList.toggle("disabled", !isFormValid);
    createBtn.style.pointerEvents = isFormValid ? "auto" : "none";
    createBtn.style.opacity = isFormValid ? "1" : "0.5";
  }
  return isFormValid;
}

document.addEventListener("DOMContentLoaded", function () {
  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const checkSubtaskIcon = document.querySelector(".subtask-icons-div .check-icon");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");

  function addSubtask() {
    const text = subtaskInput.value.trim();
    if (text !== "") {
      const newItem = document.createElement("div");
      newItem.classList.add("subtask-item", "added-subtasks");
      newItem.innerHTML = `
        <span>${text}</span>
        <img src="../img/subtask-delete.png" alt="Delete Subtask" class="subtask-icon delete-icon" />
      `;
      subtasksContainer.appendChild(newItem);
      subtaskInput.value = "";
      validateForm();
    }
  }

  if (subtaskInput && subtasksContainer) {
    if (addSubtaskBtn) {
      addSubtaskBtn.addEventListener("click", addSubtask);
    }
    if (checkSubtaskIcon) {
      checkSubtaskIcon.addEventListener("click", addSubtask);
    }

    subtasksContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-icon")) {
        e.target.parentElement.remove();
        validateForm();
      }
    });
  }
});
