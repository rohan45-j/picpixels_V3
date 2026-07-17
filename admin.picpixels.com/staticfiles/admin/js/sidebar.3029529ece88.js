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

  function setupTooltipPositioning() {
    var links = document.querySelectorAll('#nav-sidebar a[title], .nav-link[title], .sidebar-link[title]');
    links.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var wrapper = el.closest('.sidebar-narrow');
        if (!wrapper) return;
        var rect = el.getBoundingClientRect();
        var top = rect.top + rect.height / 2;
        el.style.setProperty('--tooltip-top', top + 'px');
      });
    });
  }

  var navObserver = new MutationObserver(function () {
    addTitles();
    setupTooltipPositioning();
  });

  addTitles();
  setupTooltipPositioning();

  var sidebar = document.getElementById('nav-sidebar');
  if (sidebar) {
    navObserver.observe(sidebar, { childList: true, subtree: true });
  }

  document.addEventListener('scroll', function () {
    document.querySelectorAll('.sidebar-narrow #nav-sidebar a[title], .sidebar-narrow .nav-link[title], .sidebar-narrow .sidebar-link[title]').forEach(function (el) {
      el._needsRecalc = true;
    });
  }, { passive: true });
})();
