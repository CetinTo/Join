/**
 * Initializes dropdown functionality for the user menu.
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Loading dropdown script...');
  
    const accountButton = document.querySelector('.account');
    const dropdownMenu = document.querySelector('.dropdown-menu');
  
    console.log('Account Button:', accountButton);
    console.log('Dropdown Menu:', dropdownMenu);
  
    if (accountButton && dropdownMenu) {
      console.log('Account button and dropdown menu found');
      setupDropdownToggle(accountButton, dropdownMenu);
      setupClickOutsideToClose(dropdownMenu);
      preventDropdownCloseOnClick(dropdownMenu);
    } else {
      handleMissingElements(accountButton, dropdownMenu);
    }
  });
  
  /**
   * Adds a click event to the account button to toggle dropdown visibility.
   * @param {HTMLElement} button - The account button.
   * @param {HTMLElement} menu - The dropdown menu.
   */
  function setupDropdownToggle(button, menu) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      event.preventDefault();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
  }
  
  /**
   * Closes the dropdown menu when clicking outside of it.
   * @param {HTMLElement} menu - The dropdown menu.
   */
  function setupClickOutsideToClose(menu) {
    document.addEventListener('click', function () {
      if (menu.style.display === 'block') {
        menu.style.display = 'none';
      }
    });
  }
  
  /**
   * Prevents the dropdown menu from closing when clicking inside it.
   * @param {HTMLElement} menu - The dropdown menu.
   */
  function preventDropdownCloseOnClick(menu) {
    menu.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  }
  
  /**
   * Logs specific error messages if required DOM elements are missing.
   * @param {HTMLElement|null} button - The account button.
   * @param {HTMLElement|null} menu - The dropdown menu.
   */
  function handleMissingElements(button, menu) {
    console.error('Account button or dropdown menu not found!');
    if (!button) console.error('Account button not found');
    if (!menu) console.error('Dropdown menu not found');
  }
  