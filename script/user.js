document.addEventListener('DOMContentLoaded', () => {
  // Prüfen, ob currentUser in localStorage existiert
  const currentUserData = localStorage.getItem('currentUser');
  if (currentUserData) {
    // In ein Objekt umwandeln
    const currentUser = JSON.parse(currentUserData);
    
    // Den Namen des Users anzeigen
    const nameSpan = document.querySelector('.username-span');
    if (nameSpan) {
      nameSpan.textContent = currentUser.name;
    }
    
    // Falls ein Name vorhanden ist, auch die Initialen ermitteln und anzeigen
    if (currentUser.name) {
      const initials = getInitials(currentUser.name);
      const accountDiv = document.querySelector('.account > div');
      if (accountDiv) {
        accountDiv.textContent = initials;
      }
    }
  } else {
    // Optional: Falls niemand eingeloggt ist, z.B. zum Login weiterleiten
    // window.location.href = './login-signup/login.html';
  }
});
  
function getInitials(name) {
  // Namen an Leerzeichen teilen
  const parts = name.trim().split(/\s+/);
  // Wenn nur ein Wort vorhanden ist, den ersten Buchstaben nehmen
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  // Sonst: ersten Buchstaben des ersten und letzten Wortes kombinieren
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
