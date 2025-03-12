/**
 * Logout-Funktionalität für alle Seiten
 */
function initializeLogout() {
    // Direkter Zugriff auf den Account-Button
    const accountBtn = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    // Überprüfen, ob wir die Elemente gefunden haben
    if (!accountBtn) console.error('Account-Button nicht gefunden');
    if (!dropdownMenu) console.error('Dropdown-Menü nicht gefunden');
    
    // Event-Listener für den Account-Button
    if (accountBtn && dropdownMenu) {
        accountBtn.addEventListener('click', function(e) {
            console.log('Account-Button geklickt');
            e.stopPropagation();
            
            // Wir prüfen beide möglichen Klassen-Namen
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            } else if (dropdownMenu.classList.contains('show-dropdown')) {
                dropdownMenu.classList.remove('show-dropdown');
            } else {
                // Falls keine der bekannten Klassen vorhanden ist, fügen wir beide hinzu
                dropdownMenu.classList.add('show');
                dropdownMenu.classList.add('show-dropdown');
            }
        });
        
        // Klick außerhalb schließt das Dropdown-Menü
        document.addEventListener('click', function(event) {
            if (!accountBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
                dropdownMenu.classList.remove('show-dropdown');
            }
        });
    }
    
    // Event-Listener für den Logout-Link
    const allLogoutLinks = document.querySelectorAll('a[href*="login.html"]');
    console.log('Gefundene Logout-Links:', allLogoutLinks.length);
    
    allLogoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Logout-Link geklickt');
            e.preventDefault();
            // Benutzerdaten aus dem lokalen Speicher entfernen
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            // Zur Login-Seite weiterleiten
            window.location.href = '../login-signup/login.html';
        });
    });
}

// Warte, bis das DOM vollständig geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogout);
} else {
    // Falls das Dokument bereits geladen ist
    initializeLogout();
} 