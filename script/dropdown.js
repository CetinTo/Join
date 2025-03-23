document.addEventListener('DOMContentLoaded', function () {
  console.log('Dropdown script loaded.');

  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  // Falls du einen Link für Logout hast (z.B. <a href="login.html">Logout</a>)
  // kannst du ihn gezielt abfangen:
  const logoutLink = dropdownMenu?.querySelector('a[href*="login.html"]');

  if (!accountButton || !dropdownMenu) {
    console.error('Account-Button oder Dropdown-Menü nicht gefunden!');
    return;
  }

  // --------------------------------
  // 1) Klick auf "account" -> Dropdown ein/aus
  // --------------------------------
  accountButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Wir toggeln z. B. eine Klasse "show"
    // (In CSS: .dropdown-menu { display: none; } .dropdown-menu.show { display: block; })
    dropdownMenu.classList.toggle('show');
  });

  // --------------------------------
  // 2) Klick außerhalb des Menüs -> schließt Menü
  // --------------------------------
  document.addEventListener('click', function () {
    // Wenn das Menü gerade offen ist ...
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    }
  });

  // --------------------------------
  // 3) Klick *innerhalb* des Menüs -> nicht nach außen durchreichen
  // --------------------------------
  dropdownMenu.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  // --------------------------------
  // 4) Logout-Link abfangen (optional)
  // --------------------------------
  if (logoutLink) {
    logoutLink.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      console.log('Performing logout...');
      // Hier deinen Logout-Code:
      // z.B. localStorage.clear() oder nur einzelne Keys entfernen:
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');

      // Anschließend redirecten:
      window.location.href = '../login-signup/login.html';
    });
  }
});
