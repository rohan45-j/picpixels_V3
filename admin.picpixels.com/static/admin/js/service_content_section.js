(function($) {
  'use strict';

  function toggleImageFields($select) {
    var $row = $select.closest('.inline-related') || $select.closest('.tabular-inline-panel > .form-row');
    if (!$row.length) {
      $row = $select.closest('tr');
    }
    var layout = $select.val();
    var $imageField = $row.find('.field-image, .field-image_alt, .field-image_preview');
    if (layout === 'text_only') {
      $imageField.hide();
    } else {
      $imageField.show();
    }
  }

  $(document).on('change', 'select[name$="-layout"]', function() {
    toggleImageFields($(this));
  });

  $(document).on('formset:added', function(event, $row, formsetName) {
    $row.find('select[name$="-layout"]').each(function() {
      toggleImageFields($(this));
    });
  });

  $(document).ready(function() {
    $('select[name$="-layout"]').each(function() {
      toggleImageFields($(this));
    });
  });
})(django.jQuery);
