/**
 * PicPixels Admin - User-Friendly Loading UI & Fast Feedback
 */
(function () {
  'use strict';

  let progressBar = null;
  let toastEl = null;
  let progressTimer = null;

  function initUI() {
    if (document.getElementById('admin-top-progress')) return;

    // Create top progress bar
    progressBar = document.createElement('div');
    progressBar.id = 'admin-top-progress';
    document.body.appendChild(progressBar);

    // Create toast notification
    toastEl = document.createElement('div');
    toastEl.className = 'admin-loading-toast';
    toastEl.innerHTML = `
      <div class="admin-loading-toast-spinner"></div>
      <span class="admin-loading-toast-text">Saving changes, please wait...</span>
    `;
    document.body.appendChild(toastEl);
  }

  function startProgress() {
    initUI();
    if (!progressBar) return;

    clearTimeout(progressTimer);
    progressBar.className = 'active';
    progressBar.style.width = '20%';

    progressTimer = setTimeout(() => {
      progressBar.style.width = '60%';
      progressTimer = setTimeout(() => {
        progressBar.style.width = '85%';
      }, 300);
    }, 150);
  }

  function startIndeterminate(toastText) {
    initUI();
    if (!progressBar || !toastEl) return;

    clearTimeout(progressTimer);
    progressBar.className = 'indeterminate active';

    if (toastText) {
      const textSpan = toastEl.querySelector('.admin-loading-toast-text');
      if (textSpan) textSpan.textContent = toastText;
      toastEl.classList.add('visible');
    }
  }

  function stopProgress() {
    if (!progressBar) return;
    clearTimeout(progressTimer);
    progressBar.style.width = '100%';
    setTimeout(() => {
      progressBar.classList.remove('active', 'indeterminate');
      progressBar.style.width = '0%';
      if (toastEl) toastEl.classList.remove('visible');
      document.querySelectorAll('.admin-btn-loading').forEach((btn) => {
        btn.classList.remove('admin-btn-loading');
      });
    }, 200);
  }

  function handleFormSubmissions() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      // Skip search GET forms for heavy toast
      const isGet = (form.method || 'GET').toUpperCase() === 'GET';
      if (isGet) {
        startProgress();
        return;
      }

      // Check which submit button was clicked
      const submitBtn = form.querySelector('button[type="submit"]:focus, input[type="submit"]:focus') ||
                        form.querySelector('button[type="submit"], input[type="submit"]');

      if (submitBtn) {
        submitBtn.classList.add('admin-btn-loading');
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.setAttribute('data-original-val', submitBtn.value);
          if (submitBtn.value.includes('Save')) {
            submitBtn.value = 'Saving...';
          } else if (submitBtn.value.includes('Delete')) {
            submitBtn.value = 'Deleting...';
          } else {
            submitBtn.value = 'Processing...';
          }
        }
      }

      startIndeterminate('Saving module changes, please wait...');
    }, true);
  }

  function handleLinkClicks() {
    document.addEventListener('click', function (e) {
      // Find closest link
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // Check if same origin
      if (link.origin && link.origin !== window.location.origin) return;

      // Add immediate subtle loading visual on clicked sidebar or table link
      if (link.closest('aside') || link.closest('.sidebar') || link.closest('nav') || link.closest('table')) {
        link.classList.add('admin-nav-item-loading');
      }

      startProgress();
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initUI();
      handleFormSubmissions();
      handleLinkClicks();
    });
  } else {
    initUI();
    handleFormSubmissions();
    handleLinkClicks();
  }

  // Handle browser back/forward and page restores
  window.addEventListener('pageshow', (event) => {
    stopProgress();
  });
})();
