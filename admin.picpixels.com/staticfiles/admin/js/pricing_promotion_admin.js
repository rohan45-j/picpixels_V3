(function () {
  'use strict';

  /* ── Quick date presets for start_date / end_date fields ── */
  document.addEventListener('DOMContentLoaded', function () {
    var startField = document.querySelector('[name="start_date_0"]');
    var endField = document.querySelector('[name="end_date_0"]');
    if (!startField && !endField) return;

    var presets = [
      { label: 'Today',      days: 0  },
      { label: 'Tomorrow',   days: 1  },
      { label: 'This Week',  days: 6  },
      { label: 'This Month', days: 30 },
    ];

    function formatDate(d) {
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }

    function applyPreset(field, daysOffset) {
      if (!field) return;
      var d = new Date();
      d.setDate(d.getDate() + daysOffset);
      field.value = formatDate(d);
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function createPresetBar(field) {
      if (!field) return null;
      var existing = field.parentNode.querySelector('.quick-presets');
      if (existing) return existing;

      var bar = document.createElement('div');
      bar.className = 'quick-presets';
      bar.style.cssText =
        'display:flex;gap:4px;margin-top:6px;flex-wrap:wrap';

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = p.label;
        btn.className = 'quick-preset-btn';
        btn.style.cssText =
          'padding:2px 10px;font-size:0.72rem;font-weight:600;border-radius:6px;' +
          'border:1px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer;' +
          'transition:all 0.15s ease;font-family:inherit';
        btn.addEventListener('mouseenter', function () {
          btn.style.borderColor = '#FF8A50';
          btn.style.color = '#FF8A50';
          btn.style.background = '#fff7f0';
        });
        btn.addEventListener('mouseleave', function () {
          btn.style.borderColor = '#e5e7eb';
          btn.style.color = '#374151';
          btn.style.background = '#fff';
        });
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          applyPreset(field, p.days);
        });
        bar.appendChild(btn);
      });

      // "Clear" button
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.textContent = 'Clear';
      clearBtn.className = 'quick-preset-btn quick-preset-btn-clear';
      clearBtn.style.cssText =
        'padding:2px 10px;font-size:0.72rem;font-weight:600;border-radius:6px;' +
        'border:1px solid #e5e7eb;background:#fff;color:#9ca3af;cursor:pointer;' +
        'transition:all 0.15s ease;font-family:inherit';
      clearBtn.addEventListener('mouseenter', function () {
        clearBtn.style.borderColor = '#ef4444';
        clearBtn.style.color = '#ef4444';
        clearBtn.style.background = '#fef2f2';
      });
      clearBtn.addEventListener('mouseleave', function () {
        clearBtn.style.borderColor = '#e5e7eb';
        clearBtn.style.color = '#9ca3af';
        clearBtn.style.background = '#fff';
      });
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (field) {
          field.value = '';
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      bar.appendChild(clearBtn);

      field.parentNode.appendChild(bar);
      return bar;
    }

    // Watch for Unfold's split datetime to render then attach presets
    var observer = new MutationObserver(function () {
      if (startField) createPresetBar(startField);
      if (endField) createPresetBar(endField);
    });

    var form = document.querySelector('.form-grid') ||
               document.querySelector('form') ||
               document.getElementById('pricingpromotionsection_form');
    if (form) {
      observer.observe(form, { childList: true, subtree: true });
    }

    // Also try immediately
    setTimeout(function () {
      startField = document.querySelector('[name="start_date_0"]');
      endField = document.querySelector('[name="end_date_0"]');
      if (startField) createPresetBar(startField);
      if (endField) createPresetBar(endField);
    }, 300);
  });
})();
