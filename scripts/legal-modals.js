/**
 * Global functions for legal modal dialogs
 * These functions handle privacy policy and legal notice modals across the whole application
 */

// Shows the privacy policy modal
function openPrivacyPolicy() {
  const modal = document.getElementById('privacyPolicyModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else {
    window.location.href = '/Join/resources/private-policy/privacy-policy.html';
  }
}

// Shows the legal notice modal
function openLegalNotice() {
  const modal = document.getElementById('legalNoticeModal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else {
    window.location.href = '/Join/resources/legal-notice/legal-notice.html';
  }
}

function closeModals() {
  const privacyModal = document.getElementById('privacyPolicyModal');
  const legalModal = document.getElementById('legalNoticeModal');
  if (privacyModal) privacyModal.style.display = 'none';
  if (legalModal) legalModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

document.addEventListener("DOMContentLoaded", onDomContentLoaded);

/**
 * Called when the DOM content is loaded.
 */
function onDomContentLoaded() {
  setupPrivacyLinks();
  setupLegalLinks();
  setupModalCloseHandler();
}

/**
 * Sets up event listeners for privacy-related links.
 */
function setupPrivacyLinks() {
  const privacyLinks = getPrivacyLinks();
  privacyLinks.forEach(link => {
    link.addEventListener("click", onPrivacyLinkClick);
  });
}

/**
 * Handles the click event for a privacy link.
 * @param {Event} event - The click event.
 */
function onPrivacyLinkClick(event) {
  event.preventDefault();
  openPrivacyPolicy();
}

/**
 * Sets up event listeners for legal-related links.
 */
function setupLegalLinks() {
  const legalLinks = getLegalLinks();
  legalLinks.forEach(link => {
    link.addEventListener("click", onLegalLinkClick);
  });
}

/**
 * Handles the click event for a legal link.
 * @param {Event} event - The click event.
 */
function onLegalLinkClick(event) {
  event.preventDefault();
  openLegalNotice();
}

/**
 * Sets up the modal close event listener on the window.
 */
function setupModalCloseHandler() {
  window.addEventListener("click", handleModalClose);
}


/**
 * Returns an array of links related to privacy.
 * @returns {HTMLElement[]} An array of privacy-related link elements.
 */
function getPrivacyLinks() {
  return Array.from(document.querySelectorAll("a")).filter(link =>
    link.textContent.toLowerCase().includes("privacy") ||
    link.textContent.toLowerCase().includes("privat")
  );
}

/**
 * Returns an array of links related to legal notices.
 * @returns {HTMLElement[]} An array of legal-related link elements.
 */
function getLegalLinks() {
  return Array.from(document.querySelectorAll("a")).filter(link =>
    link.textContent.toLowerCase().includes("legal") ||
    link.textContent.toLowerCase().includes("notice") ||
    link.textContent.toLowerCase().includes("imprint")
  );
}

/**
 * Handles closing of modals if the click event target is one of the modals.
 * @param {MouseEvent} event - The click event.
 */
function handleModalClose(event) {
  const privacyModal = document.getElementById("privacyPolicyModal");
  const legalModal = document.getElementById("legalNoticeModal");
  if (event.target === privacyModal) {
    privacyModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
  if (event.target === legalModal) {
    legalModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}
