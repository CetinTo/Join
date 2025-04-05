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

// Closes all modal dialogs
function closeModals() {
  const privacyModal = document.getElementById('privacyPolicyModal');
  const legalModal = document.getElementById('legalNoticeModal');
  if (privacyModal) privacyModal.style.display = 'none';
  if (legalModal) legalModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', function() {
  const privacyLinks = Array.from(document.querySelectorAll('a')).filter(link => 
    link.textContent.toLowerCase().includes('privacy') || 
    link.textContent.toLowerCase().includes('privat'));
  
  const legalLinks = Array.from(document.querySelectorAll('a')).filter(link => 
    link.textContent.toLowerCase().includes('legal') || 
    link.textContent.toLowerCase().includes('notice') ||
    link.textContent.toLowerCase().includes('imprint'));
  
  privacyLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openPrivacyPolicy();
    });
});
  
  legalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openLegalNotice();
    });
});
  
window.addEventListener('click', function(e) {
    const privacyModal = document.getElementById('privacyPolicyModal');
    const legalModal = document.getElementById('legalNoticeModal');
    
    if (e.target === privacyModal) {
      privacyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    if (e.target === legalModal) {
      legalModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}); 