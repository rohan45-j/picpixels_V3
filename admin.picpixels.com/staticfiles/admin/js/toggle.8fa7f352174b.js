(function () {
  'use strict';

  function initToggles() {
    document.querySelectorAll('.custom-toggle-checkbox').forEach(function (checkbox) {
      // Avoid binding event listeners multiple times
      if (checkbox.dataset.toggleInitialized) return;
      checkbox.dataset.toggleInitialized = 'true';

      checkbox.addEventListener('change', function () {
        const labelText = checkbox.parentNode.querySelector('.custom-toggle-label-text');
        if (labelText) {
          labelText.textContent = checkbox.checked ? 'Active' : 'Inactive';
        }
      });
    });
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggles);
  } else {
    initToggles();
  }

  // Watch for dynamic page modifications (e.g. inline additions)
  var observer = new MutationObserver(function () {
    initToggles();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
