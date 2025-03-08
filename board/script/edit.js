function toggleModalfloating() {
    let modal = document.getElementById('toggleModalFloating');
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'block';
    }
  }
  
  function toggleModalEdit() {
    let modal = document.getElementById('taskModalEdit');
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'block';
    }
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    let modal = document.getElementById("taskModalEdit");
    let modalContent = document.querySelector(".main-section-floating-edit");
  
    function toggleModalEdit() {
      if (modal.style.display === "block") {
        modal.style.display = "none";
      } else {
        modal.style.display = "block";
      }
    }
  
    function closeModalEdit() {
      modal.style.display = "none";
    }
  
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModalEdit();
      }
    });
  
    modalContent.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  
    document.querySelectorAll(".close-modal-btn").forEach(button => {
      button.addEventListener("click", closeModalEdit);
    });
  
    document.querySelectorAll(".open-modal-btn").forEach(button => {
      button.addEventListener("click", toggleModalEdit);
    });
  });
  