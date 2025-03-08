document.addEventListener("DOMContentLoaded", () => {
    let modalBackground = document.querySelector(".modal-background-task-overlay");

    if (!modalBackground) return;

    modalBackground.addEventListener("click", (event) => {
        if (event.target === modalBackground) {
            modalBackground.style.display = "none";
        }
    });

    
});