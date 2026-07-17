document.addEventListener('DOMContentLoaded', function () {
  // ── Convert status text cells to badges ──
  var statusFields = document.querySelectorAll('[class*="field-status"], [class*="field-is_"]');
  statusFields.forEach(function (el) {
    var text = el.textContent.trim().toLowerCase().replace(/\s+/g, '_');
    if (text && text !== '---' && !el.querySelector('img')) {
      el.classList.add('field-badge');
      el.classList.add(text);
      // Also add parent class for responsive labels
      var row = el.closest('tr');
      if (row) {
        var label = el.getAttribute('data-label') || '';
        if (!label) {
          // Try to find header label
          var tbl = el.closest('table');
          if (tbl) {
            var headers = tbl.querySelectorAll('thead th');
            var cells = el.closest('tr') ? el.closest('tr').querySelectorAll('td, th') : [];
            var idx = Array.prototype.indexOf.call(cells, el);
            if (idx >= 0 && headers[idx]) {
              label = headers[idx].textContent.trim();
            }
          }
        }
        el.setAttribute('data-label', label);
      }
    }
  });
});
