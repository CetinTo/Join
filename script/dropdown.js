/**
 * Initialisiert die Dropdown-Funktionalität für das Benutzermenü
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dropdown-Script wird geladen...");
    
    // Suche nach dem Account-Button und dem Dropdown-Menü
    const accountButton = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    console.log("Account-Button:", accountButton);
    console.log("Dropdown-Menü:", dropdownMenu);
    
    // Nur fortfahren, wenn beide Elemente gefunden wurden
    if (accountButton && dropdownMenu) {
        console.log('Account-Button und Dropdown-Menü gefunden');
        
        // Einfacher Event Listener ohne Klonen
        accountButton.addEventListener('click', function(event) {
            event.stopPropagation();
            event.preventDefault();
            
            // Toggle Dropdown-Anzeige
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            } else {
                dropdownMenu.style.display = 'block';
            }
        });
        
        // Dropdown bei Klick außerhalb schließen
        document.addEventListener('click', function() {
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            }
        });
        
        // Verhindern, dass Klicks im Dropdown-Menü es schließen
        dropdownMenu.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    } else {
        console.error('Account-Button oder Dropdown-Menü nicht gefunden!');
        if (!accountButton) console.error('Account-Button nicht gefunden');
        if (!dropdownMenu) console.error('Dropdown-Menü nicht gefunden');
    }
}); 