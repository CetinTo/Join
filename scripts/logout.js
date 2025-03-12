/**
 * Umfassend verbesserte Dropdown-Menü- und Logout-Funktionalität
 */
function initializeLogout() {
    // Direkter Zugriff auf den Account-Button und das Dropdown-Menü
    const accountBtn = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!accountBtn || !dropdownMenu) {
      console.error('Account-Button oder Dropdown-Menü nicht gefunden');
      return;
    }
    
    // Entferne vorhandene Event-Listener durch Klonen des Buttons
    const newAccountBtn = accountBtn.cloneNode(true);
    accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);
    
    // Event-Listener für den Account-Button: Toggle des Dropdowns
    newAccountBtn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      // Toggle beider Klassen
      dropdownMenu.classList.toggle('show');
      dropdownMenu.classList.toggle('show-dropdown');
    });
    
    // Behandlung der Links im Dropdown-Menü
    const allLinks = dropdownMenu.querySelectorAll('a');
    allLinks.forEach(link => {
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
        // Für andere Links: normale Navigation
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
  
  // Initialisierung: beim Laden des DOMs ausführen
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogout);
  } else {
    initializeLogout();
  }
  