document.addEventListener('DOMContentLoaded', () => {
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    const currentUser = JSON.parse(currentUserData);
    
    const nameSpan = document.querySelector('.username-span');
    if (nameSpan) {
      nameSpan.textContent = currentUser.name;
    }
    
    if (currentUser.name) {
      const initials = getInitials(currentUser.name);
      const accountDiv = document.querySelector('.account > div');
      if (accountDiv) {
        accountDiv.textContent = initials;
      }
    }
  }

  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (accountButton && dropdownMenu) {
    accountButton.addEventListener('click', function(event) {
      event.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function(event) {
      if (!dropdownMenu.contains(event.target) && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  const addTaskButtons = document.querySelectorAll('.add-task-button');
  addTaskButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (window.innerWidth <= 440) {
        const currentPath = window.location.pathname;
        let path;
        
        if (currentPath.includes('/board/')) {
          path = '../add-task/addtask.html';
        } else if (currentPath.includes('/contact/')) {
          path = '../add-task/addtask.html';
        } else {
          path = './add-task/addtask.html';
        }
        
        window.location.href = path;
      } else {
        const modal = document.querySelector('.add-task-modal');
        if (modal) {
          modal.style.display = 'flex';
        }
      }
    });
  });

  window.addEventListener('resize', () => {
    const modal = document.querySelector('.add-task-modal');
    if (window.innerWidth > 440 && modal) {
      modal.style.display = 'none';
    }
  });
});
  
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
