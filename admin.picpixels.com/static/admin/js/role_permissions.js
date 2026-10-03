/**
 * PicPixels Enterprise - Role & Permission Matrix Interaction
 */

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('role-perm-search');
  const selectedCountEl = document.getElementById('role-selected-count');
  const totalCountEl = document.getElementById('role-total-count');
  const selectedPctEl = document.getElementById('role-selected-pct');
  const btnSelectAll = document.getElementById('role-btn-select-all');
  const btnClearAll = document.getElementById('role-btn-clear-all');
  const btnToggleExpand = document.getElementById('role-btn-toggle-expand');
  const allCheckboxes = document.querySelectorAll('.role-perm-checkbox');
  const moduleCards = document.querySelectorAll('.role-module-card');

  // Update counters
  function updateCounters() {
    let checkedCount = 0;
    allCheckboxes.forEach((cb) => {
      if (cb.checked) checkedCount++;
    });

    const totalCount = allCheckboxes.length;
    if (selectedCountEl) selectedCountEl.textContent = checkedCount;
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (selectedPctEl && totalCount > 0) {
      selectedPctEl.textContent = Math.round((checkedCount / totalCount) * 100) + '%';
    }

    // Update module-level badges
    moduleCards.forEach((card) => {
      const cardCbs = card.querySelectorAll('.role-perm-checkbox');
      let cardChecked = 0;
      cardCbs.forEach((cb) => {
        if (cb.checked) cardChecked++;
      });
      const badge = card.querySelector('.role-module-badge');
      if (badge) {
        badge.textContent = `${cardChecked} / ${cardCbs.length} perms`;
        if (cardChecked > 0) {
          badge.classList.add('active');
        } else {
          badge.classList.remove('active');
        }
      }
    });
  }

  // Listen to individual checkbox changes
  allCheckboxes.forEach((cb) => {
    cb.addEventListener('change', updateCounters);
  });

  // Global Select All
  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', function () {
      allCheckboxes.forEach((cb) => (cb.checked = true));
      updateCounters();
    });
  }

  // Global Clear All
  if (btnClearAll) {
    btnClearAll.addEventListener('click', function () {
      allCheckboxes.forEach((cb) => (cb.checked = false));
      updateCounters();
    });
  }

  // Row All Toggle
  document.querySelectorAll('.role-row-toggle').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const row = btn.closest('tr');
      if (!row) return;
      const rowCbs = row.querySelectorAll('.role-perm-checkbox');
      const allChecked = Array.from(rowCbs).every((cb) => cb.checked);
      rowCbs.forEach((cb) => (cb.checked = !allChecked));
      updateCounters();
    });
  });

  // Module All Toggle
  document.querySelectorAll('.role-toggle-module-btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const card = btn.closest('.role-module-card');
      if (!card) return;
      const cardCbs = card.querySelectorAll('.role-perm-checkbox');
      const allChecked = Array.from(cardCbs).every((cb) => cb.checked);
      cardCbs.forEach((cb) => (cb.checked = !allChecked));
      updateCounters();
    });
  });

  // Module Accordion Toggle
  document.querySelectorAll('.role-module-header').forEach((header) => {
    header.addEventListener('click', function (e) {
      if (e.target.closest('.role-toggle-module-btn')) return;
      const card = header.closest('.role-module-card');
      if (card) {
        card.classList.toggle('collapsed');
      }
    });
  });

  // Expand / Collapse All
  let allExpanded = true;
  if (btnToggleExpand) {
    btnToggleExpand.addEventListener('click', function () {
      allExpanded = !allExpanded;
      moduleCards.forEach((card) => {
        if (allExpanded) {
          card.classList.remove('collapsed');
        } else {
          card.classList.add('collapsed');
        }
      });
      btnToggleExpand.innerHTML = allExpanded
        ? '<span>↕</span> Collapse All'
        : '<span>↕</span> Expand All';
    });
  }

  // Real-time Search
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = searchInput.value.trim().toLowerCase();

      moduleCards.forEach((card) => {
        const rows = card.querySelectorAll('.role-perm-table tbody tr');
        let cardHasMatch = false;

        rows.forEach((row) => {
          const text = row.textContent.toLowerCase();
          if (!q || text.includes(q)) {
            row.style.display = '';
            cardHasMatch = true;
          } else {
            row.style.display = 'none';
          }
        });

        const modTitle = card.querySelector('.role-module-title').textContent.toLowerCase();
        if (modTitle.includes(q)) {
          cardHasMatch = true;
          rows.forEach((r) => (r.style.display = ''));
        }

        if (cardHasMatch) {
          card.style.display = '';
          if (q) card.classList.remove('collapsed');
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Initial calculation
  updateCounters();
});
