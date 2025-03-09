document.addEventListener('DOMContentLoaded', () => {
    // 1) Prüfen, ob currentUser in localStorage existiert
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      // 2) in ein Objekt umwandeln
      const currentUser = JSON.parse(currentUserData);
      
      // 3) Referenz auf das Element holen
      const nameSpan = document.querySelector('.username-span');
      
      // 4) Den Namen des Users anzeigen
      nameSpan.textContent = currentUser.name;
    } else {
      // Falls niemand eingeloggt ist, könntest du z.B. zurück zum Login leiten
      // window.location.href = './login-signup/login.html';
    }
  });


  document.addEventListener('DOMContentLoaded', () => {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      if (currentUser.name) {
        // Initialen ermitteln
        const initials = getInitials(currentUser.name);
        // Referenz auf das Element holen, in dem die Initialen angezeigt werden sollen
        const accountDiv = document.querySelector('.account > div');
        if (accountDiv) {
          accountDiv.textContent = initials;
        }
      }
    }
  });
  
  function getInitials(name) {
    // Teile den Namen an Leerzeichen
    const parts = name.trim().split(/\s+/);
    // Falls nur ein Wort vorhanden ist, nimm nur den ersten Buchstaben
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    // Sonst: nimm den ersten Buchstaben des ersten und letzten Wortes
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  