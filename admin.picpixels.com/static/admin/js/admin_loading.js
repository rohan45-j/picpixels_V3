/**
 * PicPixels Admin - User-Friendly Loading UI & Instant Navigation Feedback
 */
(function () {
  'use strict';

  if (window.__PicPixelsLoadingInitialized) return;
  window.__PicPixelsLoadingInitialized = true;

  let progressBar = null;
  let toastEl = null;
  let progressTimer = null;
  let toastTimer = null;
  let abortFallbackTimer = null;

  function initUI() {
    if (!progressBar) {
      progressBar = document.getElementById('admin-top-progress');
      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'admin-top-progress';
        document.body.appendChild(progressBar);
      }
    }

    if (!toastEl) {
      toastEl = document.querySelector('.admin-loading-toast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'admin-loading-toast';
        toastEl.innerHTML = `
          <div class="admin-loading-toast-spinner"></div>
          <span class="admin-loading-toast-text">Saving changes, please wait...</span>
        `;
        document.body.appendChild(toastEl);
      }
    }
  }

  function startProgress() {
    initUI();
    if (!progressBar) return;

    clearTimeout(progressTimer);
    clearTimeout(abortFallbackTimer);

    progressBar.className = 'active';
    progressBar.style.width = '30%';

    progressTimer = setTimeout(() => {
      progressBar.style.width = '68%';
      progressTimer = setTimeout(() => {
        progressBar.style.width = '88%';
      }, 250);
    }, 100);

    // Safety fallback: if user stays on page (e.g. cancelled request, download, or same URL hash), reset after 5s
    abortFallbackTimer = setTimeout(stopProgress, 5000);
  }

  function startIndeterminate(toastText) {
    initUI();
    if (!progressBar || !toastEl) return;

    clearTimeout(progressTimer);
    clearTimeout(abortFallbackTimer);
    progressBar.className = 'indeterminate active';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastText) {
        const textSpan = toastEl.querySelector('.admin-loading-toast-text');
        if (textSpan) textSpan.textContent = toastText;
      }
      toastEl.classList.add('visible');
    }, 600);

    abortFallbackTimer = setTimeout(stopProgress, 8000);
  }

  function stopProgress() {
    clearTimeout(progressTimer);
    clearTimeout(toastTimer);
    clearTimeout(abortFallbackTimer);

    if (progressBar) {
      progressBar.style.width = '100%';
      setTimeout(() => {
        progressBar.classList.remove('active', 'indeterminate');
        progressBar.style.width = '0%';
      }, 180);
    }

    if (toastEl) {
      toastEl.classList.remove('visible');
    }

    document.querySelectorAll('.admin-nav-item-loading').forEach((el) => {
      el.classList.remove('admin-nav-item-loading');
    });

    document.querySelectorAll('.admin-btn-loading').forEach((btn) => {
      btn.classList.remove('admin-btn-loading');
      const orig = btn.getAttribute('data-original-val');
      if (orig && btn.tagName === 'INPUT') {
        btn.value = orig;
      }
    });
  }

  function handleFormSubmissions() {
    document.addEventListener('submit', function (e) {
      if (e.defaultPrevented) return;

      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      const isGet = (form.method || 'GET').toUpperCase() === 'GET';
      if (isGet) {
        startProgress();
        return;
      }

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

      startProgress();
      startIndeterminate('Saving changes, please wait...');
    }, true);
  }

  function init() {
    initUI();
    stopProgress();
    handleFormSubmissions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pageshow', stopProgress);
  window.addEventListener('load', stopProgress);
})();

