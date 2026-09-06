(function() {
  'use strict';

  function initSectionLayoutToggles() {
    function toggleImageFields(select) {
      if (!select) return;
      var row = select.closest('.inline-related') || select.closest('.form-row') || select.closest('tr');
      if (!row) return;
      var layout = select.value;
      var imageFields = row.querySelectorAll('.field-image, .field-image_alt, .field-image_preview');
      imageFields.forEach(function(el) {
        el.style.display = (layout === 'text_only') ? 'none' : '';
      });
    }

    document.addEventListener('change', function(e) {
      if (e.target && e.target.matches && e.target.matches('select[name$="-layout"]')) {
        toggleImageFields(e.target);
      }
    });

    document.querySelectorAll('select[name$="-layout"]').forEach(toggleImageFields);

    document.addEventListener('formset:added', function(e) {
      if (e.target && e.target.querySelectorAll) {
        e.target.querySelectorAll('select[name$="-layout"]').forEach(toggleImageFields);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionLayoutToggles);
  } else {
    initSectionLayoutToggles();
  }
})();

