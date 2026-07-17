(function () {
  'use strict';

  function addTitles() {
    document.querySelectorAll('#nav-sidebar a, #nav-sidebar-apps h2, .nav-link, .sidebar-link').forEach(function (el) {
      if (!el.getAttribute('title')) {
        var text = el.textContent.replace(/\s+/g, ' ').trim();
        if (text) {
          el.setAttribute('title', text);
        }
      }
    });
  }

  function setupTooltipPositioning() {
    var selectors = '#nav-sidebar a[title], #nav-sidebar-apps h2[title], .nav-link[title], .sidebar-link[title]';
    document.querySelectorAll(selectors).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        var wrapper = el.closest('.sidebar-narrow');
        if (!wrapper) return;
        var rect = el.getBoundingClientRect();
        var top = rect.top + rect.height / 2;
        el.style.setProperty('--tooltip-top', top + 'px');
      });
    });
  }

  function setupMobileSidebar() {
    var sidebar = document.getElementById('sidebar-main-wrapper');
    var overlay = document.getElementById('mobile-sidebar-overlay');
    if (!sidebar || !overlay) return;

    var observer = new ResizeObserver(function () {
      if (window.innerWidth >= 1280) {
        document.body.classList.remove('mobile-sidebar-open');
      }
    });
    observer.observe(document.documentElement);
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      document.body.classList.remove('mobile-sidebar-open');
    }
  }

  function addTableLabels() {
    document.querySelectorAll('#result_list thead th, .module table thead th, formset table thead th').forEach(function (th, index) {
      var label = th.textContent.replace(/\s+/g, ' ').trim();
      if (!label) return;
      var table = th.closest('table');
      if (!table) return;
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var td = tr.children[index];
        if (td && !td.hasAttribute('data-label')) {
          td.setAttribute('data-label', label);
        }
      });
    });
  }

  var tableObserver = new MutationObserver(function () {
    addTableLabels();
  });

  var navObserver = new MutationObserver(function () {
    addTitles();
    setupTooltipPositioning();
  });

  addTitles();
  setupTooltipPositioning();
  setupMobileSidebar();
  addTableLabels();
  document.addEventListener('keydown', handleEscapeKey);

  var sidebar = document.getElementById('nav-sidebar');
  if (sidebar) {
    navObserver.observe(sidebar, { childList: true, subtree: true });
  }

  var resultList = document.getElementById('result_list');
  if (resultList) {
    tableObserver.observe(resultList, { childList: true, subtree: true });
  }

  document.addEventListener('scroll', function () {
    document.querySelectorAll('.sidebar-narrow #nav-sidebar a[title], .sidebar-narrow #nav-sidebar-apps h2[title], .sidebar-narrow .nav-link[title], .sidebar-narrow .sidebar-link[title]').forEach(function (el) {
      el._needsRecalc = true;
    });
  }, { passive: true });
})();