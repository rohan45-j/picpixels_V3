(function() {
  'use strict';

  function attachContentToolbar(textarea) {
    if (!textarea || textarea.dataset.hasToolbar) return;
    textarea.dataset.hasToolbar = 'true';

    var toolbar = document.createElement('div');
    toolbar.className = 'svc-content-toolbar';
    toolbar.innerHTML = `
      <button type="button" class="svc-fmt-btn btn-link" title="Insert clickable hyperlink">
        <span>🔗</span> Add Hyperlink
      </button>
      <button type="button" class="svc-fmt-btn btn-bold" title="Bold text">
        <strong>B</strong>
      </button>
      <button type="button" class="svc-fmt-btn btn-italic" title="Italic text">
        <em>I</em>
      </button>
      <button type="button" class="svc-fmt-btn btn-list" title="Bullet list">
        • List
      </button>
    `;

    textarea.parentNode.insertBefore(toolbar, textarea);

    toolbar.querySelector('.btn-link').addEventListener('click', function(e) {
      e.preventDefault();
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selected = textarea.value.substring(start, end);
      var url = prompt('Enter link URL (e.g. /services or https://...):', 'https://');
      if (!url) return;
      var text = selected || prompt('Enter link text:', 'Learn More') || url;
      var linkTag = '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
      textarea.focus();
      textarea.setRangeText(linkTag, start, end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    toolbar.querySelector('.btn-bold').addEventListener('click', function(e) {
      e.preventDefault();
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selected = textarea.value.substring(start, end) || 'Bold text';
      textarea.focus();
      textarea.setRangeText('<strong>' + selected + '</strong>', start, end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    toolbar.querySelector('.btn-italic').addEventListener('click', function(e) {
      e.preventDefault();
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selected = textarea.value.substring(start, end) || 'Italic text';
      textarea.focus();
      textarea.setRangeText('<em>' + selected + '</em>', start, end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    toolbar.querySelector('.btn-list').addEventListener('click', function(e) {
      e.preventDefault();
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selected = textarea.value.substring(start, end) || 'List item';
      textarea.focus();
      textarea.setRangeText('\n• ' + selected, start, end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function initContentToolbars() {
    document.querySelectorAll('textarea[name^="content_sections-"][name$="-content"], #content_sections-group textarea').forEach(attachContentToolbar);
  }

  function initSectionLayoutToggles() {
    function toggleImageFields(select) {
      if (!select) return;
      var row = select.closest('.form-group') || select.closest('.inline-related') || select.closest('fieldset') || select.closest('tr');
      if (!row) return;
      var layout = select.value;
      var isTextOnly = (layout === 'text_only');
      var imageFields = row.querySelectorAll('.field-image, .field-image_alt, .field-image_preview');
      imageFields.forEach(function(el) {
        var formRow = el.closest('.form-row');
        if (formRow && formRow.querySelectorAll('.field-layout, .field-heading, .field-content').length === 0) {
          formRow.style.display = isTextOnly ? 'none' : '';
        }
        el.style.display = isTextOnly ? 'none' : '';
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
        e.target.querySelectorAll('textarea[name$="-content"]').forEach(attachContentToolbar);
      }
    });
  }

  function runAll() {
    initSectionLayoutToggles();
    initContentToolbars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  // Also run after slight delay to handle any dynamic tabs
  setTimeout(runAll, 300);
  setTimeout(runAll, 1000);
})();
