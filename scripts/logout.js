/**
 * Umfassend verbesserte Dropdown-Menü und Logout-Funktionalität
 */
function initializeLogout() {
    // Direkter Zugriff auf den Account-Button und Dropdown-Menü
    const accountBtn = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!accountBtn || !dropdownMenu) {
        console.error('Account-Button oder Dropdown-Menü nicht gefunden');
        return;
    }
    
    // Entferne alle vorhandenen Event-Listener (falls vorhanden)
    const newAccountBtn = accountBtn.cloneNode(true);
    accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);
    
    // Event-Listener für den Account-Button
    newAccountBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Toggle beide möglichen Klassen
        if (dropdownMenu.classList.contains('show') || dropdownMenu.classList.contains('show-dropdown')) {
            dropdownMenu.classList.remove('show');
            dropdownMenu.classList.remove('show-dropdown');
        } else {
            dropdownMenu.classList.add('show');
            dropdownMenu.classList.add('show-dropdown');
        }
    });
    
    // Behandle alle Links im Dropdown-Menü
    const allLinks = dropdownMenu.querySelectorAll('a');
    allLinks.forEach(link => {
        // Entferne vorhandene Event-Listener
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', function(event) {
            // Verhindert, dass das Dropdown-Menü geschlossen wird
            event.stopPropagation();
            
            // Spezielle Behandlung für Logout-Link
            if (newLink.href.includes('login.html')) {
                event.preventDefault();
                console.log('Logout wird durchgeführt...');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
                window.location.href = newLink.href;
            }
            
            // Für andere Links wie Help, Legal Notice usw.
            // Lasse den Browser die Navigation wie normal durchführen
        });
    });
    
    // Schließe das Dropdown-Menü bei Klick außerhalb
    document.addEventListener('click', function(event) {
        if (!newAccountBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
            dropdownMenu.classList.remove('show-dropdown');
        }
    });
    
    // Markiere den Button als initialisiert
    newAccountBtn.classList.add('initialized');
}

// Entferne konkurrierende Event-Listener von Inline-Scripts
window.addEventListener('load', function() {
    // Entferne potenzielle konkurrierende Event-Listener
    const inlineScripts = document.querySelectorAll('script:not([src])');
    inlineScripts.forEach(script => {
        if (script.textContent.includes('.account') && 
            script.textContent.includes('addEventListener') && 
            script.textContent.includes('dropdown-menu')) {
            
            // Ersetze den problematischen Code
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent
                .replace(/document\.querySelector\(['"]\.account['"]\)\.addEventListener\(['"](click)['"],.*?\);/gs, '// Deaktiviert: ')
                .replace(/document\.addEventListener\(['"](click)['"],.*?dropdown-menu.*?\);/gs, '// Deaktiviert: ');
            
            script.parentNode.replaceChild(newScript, script);
        }
    });
    
    // Initialisiere die neue Logik
    initializeLogout();
});

// Führe die Initialisierung auch beim DOM-Laden aus (zusätzliche Sicherheit)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogout);
} else {
    initializeLogout();
} 