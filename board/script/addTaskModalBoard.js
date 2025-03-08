document.addEventListener("DOMContentLoaded", function () {
  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      if (validateForm()) {
        addTaskToFirebase();
      }
    });
  }

  document.querySelector(".input")?.addEventListener("input", validateForm);
  document.querySelector(".date-input")?.addEventListener("input", validateForm);
  document.querySelector(".select-task")?.addEventListener("change", validateForm);
  document.querySelector(".priority-container")?.addEventListener("click", validateForm);

  const inputsToValidate = [".description", ".subtask"];
  inputsToValidate.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener("input", validateForm);
    }
  });

  const assignedContainer = document.querySelector(".assigned-to-profiles-container");
  if (assignedContainer) {
    const observer = new MutationObserver(validateForm);
    observer.observe(assignedContainer, { childList: true });
  }

  const priorityOptions = document.querySelectorAll(".priority-container div");
  if (priorityOptions) {
    priorityOptions.forEach(option => {
      option.addEventListener("click", function () {
        priorityOptions.forEach(o => o.classList.remove("active"));
        this.classList.add("active");
        validateForm();
      });
    });
  }

  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function () {
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

  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");

  if (addSubtaskBtn && subtaskInput && subtasksContainer) {
    addSubtaskBtn.addEventListener("click", function () {
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
      }
    });

    subtasksContainer.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-icon")) {
        e.target.parentElement.remove();
      }
    });
  }

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
    
    const resData = await response.json();

    const firebaseId = resData.name;
    if (!firebaseId) {
      return;
    }

    const idResponse = await fetch(`https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${firebaseId}/id.json`, {
      method: "PUT",
      body: JSON.stringify(firebaseId)
    });
    await idResponse.json();

    clearForm();
    closeModal();
    location.reload();

  } catch (error) {
    
  } finally {
    isSaving = false;
  }
}

function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) {
    modal.style.display = "none";
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
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (subtasksContainer) subtasksContainer.innerHTML = "";
}

function validateForm() {
  const title = document.querySelector(".input").value.trim();
  const dueDate = document.querySelector(".date-input").value.trim();
  const category = document.querySelector(".select-task").value;
  const assignedUsers = selectedContacts.length > 0;
  const prioritySelected = document.querySelector(".priority-container .active") !== null;
  const hasAtLeastOneSubtask = document.querySelectorAll(".added-subtasks").length > 0;

  const createBtn = document.querySelector(".create-btn");

  if (
    title &&
    dueDate &&
    category &&
    assignedUsers &&
    prioritySelected &&
    hasAtLeastOneSubtask
  ) {
    createBtn.classList.remove("disabled");
    createBtn.style.pointerEvents = "auto";
    createBtn.style.opacity = "1";
    return true;
  } else {
    createBtn.classList.add("disabled");
    createBtn.style.pointerEvents = "none";
    createBtn.style.opacity = "0.5";
    return false;
  }
}
