(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initPortfolioFilter();
    initHomepageFilter();
    initLoadMore();
    initSearch();
    initScrollAnim();
  });

  /* ─────────────────────────────────────────────────────
     PORTFOLIO LIST PAGE — Category Filter + Search + Load More
     ───────────────────────────────────────────────────── */

  var currentCategory = '';
  var currentSearch = '';
  var currentPage = 1;
  var isLoading = false;

  function initPortfolioFilter() {
    var filterBar = document.getElementById('pfFilterBar');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.pf-filter-btn');
      if (!btn || btn.classList.contains('active')) return;

      filterBar.querySelectorAll('.pf-filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      currentCategory = btn.dataset.category || '';
      currentPage = 1;
      fetchProjects();
    });
  }

  function initHomepageFilter() {
    var filterBar = document.getElementById('hpFilterBar');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.pf-filter-btn');
      if (!btn || btn.classList.contains('active')) return;

      filterBar.querySelectorAll('.pf-filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var catSlug = btn.dataset.category || '';
      var grid = document.getElementById('pfGrid');
      if (!grid) return;

      var params = new URLSearchParams();
      if (catSlug) params.set('category', catSlug);

      grid.style.opacity = '0.3';
      fetch(window.location.pathname + '?' + params.toString(), {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          grid.innerHTML = data.html;
          grid.style.opacity = '1';
          initScrollAnim();
        })
        .catch(function () { grid.style.opacity = '1'; });
    });
  }

  function initSearch() {
    var input = document.getElementById('plSearch');
    if (!input) return;

    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        currentSearch = input.value.trim();
        currentPage = 1;
        fetchProjects();
      }, 350);
    });
  }

  function initLoadMore() {
    var btn = document.getElementById('pfLoadMore');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (isLoading) return;
      currentPage = parseInt(this.dataset.page, 10);
      fetchProjects(true);
    });
  }

  function fetchProjects(append) {
    if (isLoading) return;
    isLoading = true;

    var grid = document.getElementById('pfGrid');
    var controls = document.getElementById('pfControls');
    if (!grid) { isLoading = false; return; }

    var params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    params.set('page', currentPage);
    params.set('load_more', '1');

    grid.style.opacity = '0.3';

    fetch(window.location.pathname + '?' + params.toString(), {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (append) {
          var temp = document.createElement('div');
          temp.innerHTML = data.html;
          Array.from(temp.children).forEach(function (c) { grid.appendChild(c); });
          grid.style.opacity = '1';
        } else {
          grid.innerHTML = data.html;
          grid.style.opacity = '1';
        }

        initScrollAnim();

        if (controls) {
          if (data.has_next) {
            var nextPage = currentPage + 1;
            controls.innerHTML =
              '<button id="pfLoadMore" class="pf-load-more" data-page="' + nextPage + '">' +
              '<span>Load More Projects</span>' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></button>';
            document.getElementById('pfLoadMore').addEventListener('click', function () {
              if (isLoading) return;
              currentPage = parseInt(this.dataset.page, 10);
              fetchProjects(true);
            });
          } else {
            controls.innerHTML = '';
          }
        }

        isLoading = false;
      })
      .catch(function () {
        grid.style.opacity = '1';
        isLoading = false;
      });
  }

  /* ─────────────────────────────────────────────────────
     SCROLL ANIMATIONS
     ───────────────────────────────────────────────────── */

  function initScrollAnim() {
    var cards = document.querySelectorAll('.pf-card:not(.visible)');
    if (!cards.length) return;

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
      cards.forEach(function (c) { obs.observe(c); });
    } else {
      cards.forEach(function (c) { c.classList.add('visible'); });
    }
  }

})();
