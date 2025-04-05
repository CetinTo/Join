/**
 * Fetches tasks from Firebase.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of task objects (excluding null or undefined).
 */
async function fetchTasks() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Load error: ${response.status} ${response.statusText}`);
  }
  const tasks = await response.json();
  const tasksArray = tasks
    ? (Array.isArray(tasks) ? tasks : Object.values(tasks))
    : [];
  const validTasks = tasksArray.filter(
    (item) => item && typeof item === "object"
  );
  return validTasks;
}

/**
 * A safe filter that ensures we only pass items that have the specified key.
 * @param {Array<Object>} tasksArray - The array of tasks to filter.
 * @param {function(Object): boolean} filterFn - The filter condition.
 * @param {string[]} requiredProps - Keys that each task must have.
 * @returns {number} The count of tasks matching the filter.
 */
function countWithSafeFilter(tasksArray, filterFn, requiredProps = []) {
  return tasksArray.reduce((count, task) => {
    for (const prop of requiredProps) {
      if (!(prop in task)) {
        return count;
      }
    }
    if (filterFn(task)) {
      count++;
    }
    return count;
  }, 0);
}

/**
 * Loads a task counter by filtering tasks based on the provided filter function
 * and updates the counter element specified by the selector.
 * @param {function(Object): boolean} filterFn - The filter function for tasks.
 * @param {string} selector - The CSS selector for the counter element.
 * @param {string[]} requiredProps - Keys that must exist on each task.
 */
async function loadTaskCounter(filterFn, selector, requiredProps = []) {
  try {
    const tasksArray = await fetchTasks();
    const count = countWithSafeFilter(tasksArray, filterFn, requiredProps);
    updateCounter(count, selector);
  } catch (error) {
    // Errors are silently ignored.
  }
}

/**
 * Updates the task counter element and saves the count to localStorage.
 * @param {number} count - The number to display.
 * @param {string} selector - The CSS selector of the element to update.
 */
function updateCounter(count, selector) {
  const counterElement = document.querySelector(selector);
  if (counterElement) {
    counterElement.textContent = count;
    localStorage.setItem(selector, count);
  }
}

/**
 * Loads task counters that depend on the task's column property.
 */
function loadColumnBasedCounters() {
  loadTaskCounter(task => task.column === "toDoColumn", ".counter", ["column"]);
  loadTaskCounter(task => task.column === "done", ".counter-done", ["column"]);
  loadTaskCounter(task => task.column === "inProgress", ".counter-in-progress", ["column"]);
  loadTaskCounter(task => task.column === "awaitFeedback", ".counter-await-feedback", ["column"]);
}

/**
 * Loads task counters that do not depend solely on the column property.
 */
function loadOtherCounters() {
  loadTaskCounter(task => task.priority === "../../img/priority-img/urgent.png", ".urgent-counter", ["priority"]);
  loadTaskCounter(() => true, ".counter-tasks-in-board");
}

/**
 * Loads all task counters after the DOM content is loaded.
 */
function loadAllTaskCounters() {
  loadColumnBasedCounters();
  loadOtherCounters();
}


document.addEventListener("DOMContentLoaded", () => {
  loadAllTaskCounters();
});

/* -------------------------------------------------------------------------- */
/*                         Greeting Section Setup                             */
/* -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const greetingText = document.querySelector(".greeting-section");
  const greetingContainer = document.querySelector(".greeting-section-container");
  if (greetingText && greetingContainer) {
    greetingText.addEventListener("animationend", (e) => {
      if (e.animationName === "slideText") {
        greetingContainer.style.display = "none";
      }
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                       Viewport Height Setup                                */
/* -------------------------------------------------------------------------- */

/**
 * Sets the --vh CSS variable based on the current viewport height.
 */
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setViewportHeight);
setViewportHeight();
