(function() {
  'use strict';

  function initTagInput(widget) {
    if (!widget || widget.dataset.tagInitialized === 'true') return;
    widget.dataset.tagInitialized = 'true';

    var list = widget.querySelector('.tag-input-list');
    var hidden = widget.querySelector('.tag-hidden-input');
    var countEl = widget.querySelector('.tag-input-count');
    var countTextEl = widget.querySelector('.tag-input-count-text');
    var clearAllBtn = widget.querySelector('.tag-clear-all-btn');
    var addBtn = widget.querySelector('.tag-add-row-btn');
    var listMode = widget.querySelector('.tag-input-list-mode');
    var bulkMode = widget.querySelector('.tag-input-bulk-mode');
    var bulkToggleBtn = widget.querySelector('.tag-bulk-toggle-btn');
    var bulkTextarea = widget.querySelector('.tag-bulk-textarea');
    var bulkApplyBtn = widget.querySelector('.tag-bulk-apply-btn');
    var bulkCancelBtn = widget.querySelector('.tag-bulk-cancel-btn');

    if (!list || !hidden) return;

    function sync() {
      var items = [];
      var rows = list.querySelectorAll('.tag-input-row');
      rows.forEach(function(row, idx) {
        var input = row.querySelector('.tag-input-field');
        var val = input ? input.value.trim() : '';
        if (val !== '') {
          items.push(val);
        }
        var idxEl = row.querySelector('.tag-input-index');
        if (idxEl) idxEl.textContent = (idx + 1);
      });

      hidden.value = JSON.stringify(items);

      if (countEl) countEl.textContent = items.length;
      if (countTextEl) countTextEl.textContent = items.length === 1 ? 'Feature' : 'Features';
      if (clearAllBtn) clearAllBtn.style.display = items.length > 0 ? '' : 'none';

      var emptyMsg = list.querySelector('.tag-input-empty-msg');
      if (rows.length === 0) {
        if (!emptyMsg) {
          var div = document.createElement('div');
          div.className = 'tag-input-empty-msg';
          div.textContent = 'No features added yet. Click "+ Add Feature" or paste a list using "Bulk Edit".';
          list.appendChild(div);
        }
      } else if (emptyMsg) {
        emptyMsg.remove();
      }
    }

    function createRow(value, focus) {
      var emptyMsg = list.querySelector('.tag-input-empty-msg');
      if (emptyMsg) emptyMsg.remove();

      var count = list.querySelectorAll('.tag-input-row').length + 1;
      var row = document.createElement('div');
      row.className = 'tag-input-row';
      row.innerHTML = 
        '<span class="tag-input-index">' + count + '</span>' +
        '<div class="tag-input-field-wrap">' +
          '<input type="text" class="tag-input-field" placeholder="Enter feature (e.g. 50 revisions included)..." autocomplete="off">' +
        '</div>' +
        '<div class="tag-input-row-controls">' +
          '<button type="button" class="tag-row-btn tag-move-up" title="Move Up">↑</button>' +
          '<button type="button" class="tag-row-btn tag-move-down" title="Move Down">↓</button>' +
          '<button type="button" class="tag-row-btn tag-row-del" title="Delete feature">&times;</button>' +
        '</div>';

      var input = row.querySelector('.tag-input-field');
      if (value) input.value = value;

      bindRowEvents(row);
      list.appendChild(row);

      sync();

      if (focus) {
        setTimeout(function() {
          input.focus();
        }, 15);
      }
      return row;
    }

    function bindRowEvents(row) {
      var input = row.querySelector('.tag-input-field');
      var delBtn = row.querySelector('.tag-row-del');
      var upBtn = row.querySelector('.tag-move-up');
      var downBtn = row.querySelector('.tag-move-down');

      if (input) {
        input.addEventListener('input', sync);

        // Enter key to add next feature immediately
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            createRow('', true);
          } else if (e.key === 'Backspace' && input.value === '') {
            var prevRow = row.previousElementSibling;
            if (prevRow && prevRow.classList.contains('tag-input-row')) {
              e.preventDefault();
              var prevInput = prevRow.querySelector('.tag-input-field');
              row.remove();
              sync();
              if (prevInput) prevInput.focus();
            }
          }
        });

        // Paste support: split newlines into separate rows
        input.addEventListener('paste', function(e) {
          var pasteData = (e.clipboardData || window.clipboardData).getData('text');
          if (pasteData && (pasteData.indexOf('\n') !== -1 || pasteData.indexOf('\r') !== -1)) {
            e.preventDefault();
            var lines = pasteData.split(/\r?\n/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
            if (lines.length > 0) {
              input.value = lines[0];
              for (var i = 1; i < lines.length; i++) {
                createRow(lines[i], false);
              }
              sync();
            }
          }
        });
      }

      if (delBtn) {
        delBtn.addEventListener('click', function(e) {
          e.preventDefault();
          row.remove();
          sync();
        });
      }

      if (upBtn) {
        upBtn.addEventListener('click', function(e) {
          e.preventDefault();
          var prev = row.previousElementSibling;
          if (prev && prev.classList.contains('tag-input-row')) {
            list.insertBefore(row, prev);
            sync();
          }
        });
      }

      if (downBtn) {
        downBtn.addEventListener('click', function(e) {
          e.preventDefault();
          var next = row.nextElementSibling;
          if (next && next.classList.contains('tag-input-row')) {
            list.insertBefore(next, row);
            sync();
          }
        });
      }
    }

    // Bind existing rows
    list.querySelectorAll('.tag-input-row').forEach(bindRowEvents);

    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        createRow('', true);
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to clear all features?')) {
          list.innerHTML = '';
          sync();
        }
      });
    }

    // Bulk edit toggle
    if (bulkToggleBtn && bulkMode && listMode) {
      bulkToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var items = [];
        list.querySelectorAll('.tag-input-row').forEach(function(row) {
          var input = row.querySelector('.tag-input-field');
          if (input && input.value.trim()) items.push(input.value.trim());
        });
        bulkTextarea.value = items.join('\n');
        listMode.style.display = 'none';
        bulkMode.style.display = '';
        bulkTextarea.focus();
      });
    }

    if (bulkCancelBtn) {
      bulkCancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        bulkMode.style.display = 'none';
        listMode.style.display = '';
      });
    }

    if (bulkApplyBtn) {
      bulkApplyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var text = bulkTextarea.value || '';
        var lines = text.split(/\r?\n/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
        list.innerHTML = '';
        lines.forEach(function(line) {
          createRow(line, false);
        });
        sync();
        bulkMode.style.display = 'none';
        listMode.style.display = '';
      });
    }
  }

  function initAllWidgets(root) {
    var scope = root || document;
    if (scope.classList && scope.classList.contains('tag-input-widget')) {
      initTagInput(scope);
    }
    scope.querySelectorAll('.tag-input-widget').forEach(initTagInput);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initAllWidgets(document); });
  } else {
    initAllWidgets(document);
  }

  // Support Django admin dynamic inlines
  document.addEventListener('formset:added', function(e) {
    if (e.target && e.target.querySelectorAll) {
      initAllWidgets(e.target);
    }
  });

  window.initTagInputWidgets = initAllWidgets;
})();
