/**
 * Initialisiert die Dropdown-Funktionalität für das Benutzermenü
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Dropdown-Script wird geladen...");
    
    // Direkter Zugriff auf die Elemente mit Klassen
    const accountButton = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    console.log("Account-Button:", accountButton);
    console.log("Dropdown-Menü:", dropdownMenu);
    
    if (accountButton && dropdownMenu) {
        console.log('Account-Button und Dropdown-Menü gefunden');
        
        // Event-Listener für Klick auf Account-Button
        accountButton.addEventListener('click', function(event) {
            console.log('Account-Button wurde geklickt');
            event.stopPropagation(); // Verhindert, dass das Klick-Event zum Dokument weitergeleitet wird
            dropdownMenu.classList.toggle('show-dropdown');
            console.log("Dropdown-Klassen nach Toggle:", dropdownMenu.className);
        });
        
        // Event-Listener für Klick außerhalb des Dropdown-Menüs
        document.addEventListener('click', function(event) {
            if (!dropdownMenu.contains(event.target) && !accountButton.contains(event.target)) {
                dropdownMenu.classList.remove('show-dropdown');
            }
        });
        
        // Event-Listener für die Dropdown-Menü-Elemente
        const dropdownItems = document.querySelectorAll('.dropdown-content-div');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                // Hier können Sie zusätzliche Aktionen hinzufügen, wenn auf ein Menüelement geklickt wird
                dropdownMenu.classList.remove('show-dropdown');
            });
        });
    } else {
        console.error('Account-Button oder Dropdown-Menü nicht gefunden!');
        if (!accountButton) console.error('Account-Button nicht gefunden');
        if (!dropdownMenu) console.error('Dropdown-Menü nicht gefunden');
    }
}); 