/**
 * Ermittelt den korrekten Pfad zur Login-Seite basierend auf der aktuellen URL
 * @returns {string} Der korrekte Pfad zur Login-Seite
 */
function getLoginPath() {
  // Aktuellen Pfad analysieren
  const currentPath = window.location.pathname;
  
  // Verschiedene Fälle abdecken
  if (currentPath.includes('/Join/')) {
    // Wenn wir in einem /Join/ Verzeichnis sind
    if (currentPath.split('/').length > 3) {
      // In einem Unterverzeichnis (z.B. /Join/contact/...)
      return '../login-signup/login.html';
    } else {
      // Im Root-Verzeichnis (/Join/)
      return './login-signup/login.html';
    }
  } else {
    // Standardfall - versuche relativen Pfad
    return 'login-signup/login.html';
  }
}

/**
 * Führt Logout durch und leitet zur Login-Seite weiter
 */
function logout() {
  // User-Daten entfernen
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  
  // Zur Login-Seite weiterleiten
  window.location.href = getLoginPath();
}

/**
 * Alternative Logout-Funktion (für die Konsistenz beibehalten)
 */
function logoutToLogin() {
  logout(); // Die gleiche Logik verwenden
}
