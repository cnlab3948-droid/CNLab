/**
 * CNLab Website — Survey Module
 * Google Forms 임베드 모달 관리
 */

(function () {
  'use strict';

  const modal = document.getElementById('survey-modal');
  const modalTitle = document.getElementById('survey-modal-title');
  const modalIframe = document.getElementById('survey-modal-iframe');

  /**
   * Open survey modal with Google Forms embed
   * @param {string} title - Survey title
   * @param {string} formUrl - Google Forms embed URL
   */
  window.openSurveyModal = function (title, formUrl) {
    modalTitle.textContent = title;
    modalIframe.src = formUrl;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close survey modal
   */
  window.closeSurveyModal = function () {
    modal.classList.remove('active');
    modalIframe.src = '';
    document.body.style.overflow = '';
  };

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      window.closeSurveyModal();
    }
  });
})();
