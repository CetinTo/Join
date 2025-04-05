/**
 * Fetches tasks from Firebase and updates the to-do task counter.
 */
async function loadTaskCounterFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".counter");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let toDoCount = tasksArray.filter(task => task.column === "toDoColumn").length;
    updateCounter(toDoCount, ".counter");
  } catch (error) {}
}

/**
 * Fetches tasks from Firebase and updates the done task counter.
 */
async function loadDoneTaskCounterFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".counter-done");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let doneCount = tasksArray.filter(task => task.column === "done").length;
    updateCounter(doneCount, ".counter-done");
  } catch (error) {}
}

/**
 * Fetches tasks from Firebase and updates the urgent task counter.
 */
async function loadUrgentTaskCounterFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".urgent-counter");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let urgentCount = tasksArray.filter(task => task.priority === "../../img/priority-img/urgent.png").length;
    updateCounter(urgentCount, ".urgent-counter");
  } catch (error) {}
}

/**
 * Fetches all tasks from Firebase and updates the total task counter.
 */
async function loadTotalTaskCount() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".counter-tasks-in-board");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let totalCount = tasksArray.length;
    updateCounter(totalCount, ".counter-tasks-in-board");
  } catch (error) {}
}

/**
 * Fetches tasks from Firebase and updates the in-progress task counter.
 */
async function loadInProgressTaskCounterFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".counter-in-progress");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let inProgressCount = tasksArray.filter(task => task.column === "inProgress").length;
    updateCounter(inProgressCount, ".counter-in-progress");
  } catch (error) {}
}

/**
 * Fetches tasks from Firebase and updates the "await feedback" task counter.
 */
async function loadAwaitFeedbackTaskCounterFromFirebase() {
  const url = "https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData.json";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Load error: ${response.status} ${response.statusText}`);
    let tasks = await response.json();
    if (!tasks) {
      updateCounter(0, ".counter-await-feedback");
      return;
    }
    let tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
    let awaitFeedbackCount = tasksArray.filter(task => task.column === "awaitFeedback").length;
    updateCounter(awaitFeedbackCount, ".counter-await-feedback");
  } catch (error) {}
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
 * Loads all task counters after the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadTaskCounterFromFirebase();
  loadDoneTaskCounterFromFirebase();
  loadUrgentTaskCounterFromFirebase();
  loadTotalTaskCount();
  loadInProgressTaskCounterFromFirebase();
  loadAwaitFeedbackTaskCounterFromFirebase();
});

document.addEventListener('DOMContentLoaded', () => {
  const greetingText = document.querySelector('.greeting-section');
  const greetingContainer = document.querySelector('.greeting-section-container');
    if (greetingText && greetingContainer) {
    greetingText.addEventListener('animationend', (e) => {
      if (e.animationName === 'slideText') {
        greetingContainer.style.display = 'none';
      }
    });
  }
});



/**
 * Sets the --vh CSS variable based on the current viewport height.
 */
function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setViewportHeight);
setViewportHeight();
