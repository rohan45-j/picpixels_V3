(function () {
  'use strict';

  function updateToggleLabel(checkbox) {
    const container = checkbox.closest('.custom-toggle-container');
    if (!container) return;
    
    const labelText = container.querySelector('.custom-toggle-label-text');
    if (labelText) {
      labelText.textContent = checkbox.checked ? 'Active' : 'Inactive';
    }
  }

  function initToggle(checkbox) {
    if (checkbox.dataset.toggleInitialized) return;
    checkbox.dataset.toggleInitialized = 'true';

    checkbox.addEventListener('change', function () {
      updateToggleLabel(this);
    });

    updateToggleLabel(checkbox);
  }

  function initToggles() {
    document.querySelectorAll('.custom-toggle-checkbox').forEach(initToggle);
  }

  function initListEditableToggles() {
    document.querySelectorAll('#changelist .custom-toggle-checkbox').forEach(function(checkbox) {
      if (checkbox.dataset.listEditableInitialized) return;
      checkbox.dataset.listEditableInitialized = 'true';

      checkbox.addEventListener('change', function() {
        updateToggleLabel(this);
        const form = this.closest('form');
        if (form) {
          const submitBtn = form.querySelector('input[type="submit"][name="_save"]');
          if (submitBtn) submitBtn.click();
        }
      });

      updateToggleLabel(checkbox);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initToggles();
      initListEditableToggles();
    });
  } else {
    initToggles();
    initListEditableToggles();
  }

  var observer = new MutationObserver(function () {
    initToggles();
    initListEditableToggles();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();