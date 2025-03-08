document.addEventListener("DOMContentLoaded", function () {
    let modalToDo = document.getElementById('taskModal');
    let addButtonToDo = document.getElementById('addTaskButtonTodo');
    let modalInProgress = document.getElementById('taskModal');
    let addButtonInProgress = document.getElementById('addTaskButtonInProgress');
    let modalAwaitFeedback = document.getElementById('taskModal');
    let addButtonAwaitFeedback = document.getElementById('addTaskButtonAwaitFeedback');
    let modalAddTaskButton = document.getElementById('taskModal');
    let addButton = document.getElementById('addTaskButton');

    if (addButtonToDo) {
        addButtonToDo.addEventListener('click', () => {
            modalToDo.style.display = 'block';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modalToDo) {
                modalToDo.style.display = 'none';
            }
        });
    }

    if (addButtonInProgress) {
        addButtonInProgress.addEventListener('click', () => {
            modalInProgress.style.display = 'block';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modalInProgress) {
                modalInProgress.style.display = 'none';
            }
        });
    }

    if (addButtonAwaitFeedback) {
        addButtonAwaitFeedback.addEventListener('click', () => {
            modalAwaitFeedback.style.display = 'block';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modalAwaitFeedback) {
                modalAwaitFeedback.style.display = 'none';
            }
        });
    }

    if (addButton) {
        addButton.addEventListener('click', () => {
            modalAwaitFeedback.style.display = 'block';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modalAwaitFeedback) {
                modalAwaitFeedback.style.display = 'none';
            }
        });
    }

    window.toggleModal = function () {
        const modal = document.getElementById('taskModal');
        if (modal) {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            } else {
                modal.style.display = 'block';
            }
        }
    };



    
    

    // Account-Dropdown-Menü mit Existenzprüfung
    const accountButton = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (accountButton && dropdownMenu) {
        accountButton.addEventListener('click', function (event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', function (event) {
            if (!dropdownMenu.contains(event.target) && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
});

// Account dropdown menu ********************************************************************





