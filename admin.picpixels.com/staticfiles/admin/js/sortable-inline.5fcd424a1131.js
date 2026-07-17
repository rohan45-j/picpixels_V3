(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.inline-group.sortable').forEach(function (group) {
      var table = group.querySelector('table');
      if (!table) return;

      var tbody = table.querySelector('tbody');
      if (!tbody) return;

      var rows = tbody.querySelectorAll('tr.has_original, tr.form-row');
      if (rows.length === 0) return;

      var dragCol = table.querySelector('thead th:first-child');
      if (dragCol) dragCol.textContent = '\u2630';

      rows.forEach(function (row) {
        var orderInput = row.querySelector('input[name$="sort_order"]');
        if (!orderInput) return;

        var firstTd = row.querySelector('td:first-child');
        if (!firstTd) return;

        var handle = document.createElement('span');
        handle.className = 'sortable-handle';
        handle.innerHTML = '\u2630';
        handle.title = 'Drag to reorder';
        handle.style.cssText =
          'cursor:grab;padding:8px 6px;display:inline-block;font-size:16px;' +
          'color:#888;user-select:none;touch-action:none;';
        firstTd.insertBefore(handle, firstTd.firstChild);

        row.draggable = true;

        row.addEventListener('dragstart', function (e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', row.dataset.sortableId || '');
          row.classList.add('sortable-dragging');
        });

        row.addEventListener('dragend', function () {
          row.classList.remove('sortable-dragging');
          rows.forEach(function (r) { r.classList.remove('sortable-over'); });
        });

        row.addEventListener('dragover', function (e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          rows.forEach(function (r) { r.classList.remove('sortable-over'); });
          if (row !== document.querySelector('.sortable-dragging')) {
            row.classList.add('sortable-over');
          }
        });

        row.addEventListener('dragleave', function () {
          row.classList.remove('sortable-over');
        });

        row.addEventListener('drop', function (e) {
          e.preventDefault();
          row.classList.remove('sortable-over');
          var dragging = document.querySelector('.sortable-dragging');
          if (!dragging || dragging === row) return;

          var parent = row.parentNode;
          var siblings = Array.from(parent.querySelectorAll('tr.has_original, tr.form-row'));

          var fromIdx = siblings.indexOf(dragging);
          var toIdx = siblings.indexOf(row);

          if (fromIdx < toIdx) {
            row.parentNode.insertBefore(dragging, row.nextSibling);
          } else {
            row.parentNode.insertBefore(dragging, row);
          }

          renumberOrders();
        });
      });

      function renumberOrders() {
        var allRows = tbody.querySelectorAll('tr.has_original, tr.form-row');
        allRows.forEach(function (r, idx) {
          var inp = r.querySelector('input[name$="sort_order"]');
          if (inp) inp.value = idx;
        });
      }
    });
  });
})();
