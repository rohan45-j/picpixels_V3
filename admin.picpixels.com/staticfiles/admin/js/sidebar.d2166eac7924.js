(function () {
  'use strict';

  function addTitles() {
    document.querySelectorAll('#nav-sidebar a, .nav-link, .sidebar-link').forEach(function (el) {
      if (!el.getAttribute('title')) {
        var text = el.textContent.replace(/\s+/g, ' ').trim();
        if (text) {
          el.setAttribute('title', text);
        }
      }
    });
  }

  addTitles();

  var observer = new MutationObserver(addTitles);
  var sidebar = document.getElementById('nav-sidebar');
  if (sidebar) {
    observer.observe(sidebar, { childList: true, subtree: true });
  }
})();
