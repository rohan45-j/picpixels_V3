/**
 * PicPixels Admin - High-Speed AJAX Inline Toggles & Field Updates
 * Eliminates full-page reloads and browser hangs on inline edits.
 */
(function () {
  'use strict';

  function getCsrfToken() {
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    if (input && input.value) return input.value;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.startsWith('csrftoken=')) {
        return decodeURIComponent(c.substring(10));
      }
    }
    return '';
  }

  function getModelInfo() {
    const path = window.location.pathname;
    const clean = path.replace(/^\/admin\//, '').replace(/\/$/, '');
    const parts = clean.split('/');
    if (parts.length >= 2) {
      return {
        app_label: parts[0],
        model_name: parts[1]
      };
    }
    return null;
  }

  function getRowObjectId(row) {
    if (!row) return null;

    // 1. Unfold / Django action-select checkbox
    const actionCb = row.querySelector('input.action-select, input[name="_selected_action"]');
    if (actionCb && actionCb.value) return actionCb.value;

    // 2. Hidden id / pk input in list_editable
    const hiddenId = row.querySelector('input[type="hidden"][name$="-id"], input[type="hidden"][name$="-pk"]');
    if (hiddenId && hiddenId.value) return hiddenId.value;

    // 3. Edit link containing pk
    const editLink = row.querySelector('a[href*="/change/"]');
    if (editLink) {
      const m = editLink.getAttribute('href').match(/\/([^\/]+)\/change\//);
      if (m && m[1]) return m[1];
    }

    // 4. Data attributes
    const dataId = row.getAttribute('data-id') || row.getAttribute('data-object-id');
    if (dataId) return dataId;

    return null;
  }

  // Modern lightweight toast for instant feedback
  let toastContainer = null;
  function showQuickToast(message, type) {
    type = type || 'success';
    if (!toastContainer) {
      toastContainer = document.getElementById('admin-quick-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'admin-quick-toast-container';
        document.body.appendChild(toastContainer);
      }
    }

    const toast = document.createElement('div');
    toast.className = 'admin-quick-toast ' + type;
    const icon = type === 'success' ? '✓' : (type === 'error' ? '⚠' : 'ℹ');
    toast.innerHTML = `<span class="quick-toast-icon">${icon}</span><span class="quick-toast-msg">${message}</span>`;

    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2200);
  }

  function updateToggleLabel(checkbox) {
    const container = checkbox.closest('.custom-toggle-container');
    if (!container) return;
    const labelText = container.querySelector('.custom-toggle-label-text');
    if (labelText) {
      labelText.textContent = checkbox.checked ? 'Active' : 'Inactive';
    }
  }

  // Standard toggle behavior (updates label)
  function initToggle(checkbox) {
    if (checkbox.dataset.toggleInitialized) return;
    checkbox.dataset.toggleInitialized = 'true';

    checkbox.addEventListener('change', function () {
      updateToggleLabel(this);
    });

    updateToggleLabel(checkbox);
  }

  function initToggles() {
    document.querySelectorAll('.custom-toggle-checkbox').forEach(initToggle);
  }

  // High-Speed AJAX Toggles for Changelist
  function initListEditableToggles() {
    const changelist = document.getElementById('changelist') || document.querySelector('.change-list') || document.querySelector('form#changelist-form');
    if (!changelist) return;

    changelist.querySelectorAll('.custom-toggle-checkbox').forEach(function (checkbox) {
      if (checkbox.dataset.listEditableAjaxInitialized) return;
      checkbox.dataset.listEditableAjaxInitialized = 'true';

      checkbox.addEventListener('change', function () {
        updateToggleLabel(this);

        const row = this.closest('tr') || this.closest('.data-row') || this.closest('tbody');
        const objectId = getRowObjectId(row);
        const modelInfo = getModelInfo();
        const fieldName = this.dataset.fieldName || (this.name ? this.name.replace(/^form-\d+-/, '') : '');

        const wrapper = this.closest('.custom-toggle-wrapper') || this.parentElement;

        if (!modelInfo || !objectId || !fieldName) {
          // If we cannot identify the record via AJAX, fallback to form submit
          const form = this.closest('form');
          if (form) {
            const submitBtn = form.querySelector('input[type="submit"][name="_save"]');
            if (submitBtn) submitBtn.click();
          }
          return;
        }

        // Fast AJAX Update
        if (wrapper) {
          wrapper.classList.remove('saved', 'error');
          wrapper.classList.add('saving');
        }

        const self = this;
        const newValue = self.checked;

        fetch('/admin/quick-update/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({
            app_label: modelInfo.app_label,
            model_name: modelInfo.model_name,
            object_id: objectId,
            field_name: fieldName,
            value: newValue
          })
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            if (wrapper) wrapper.classList.remove('saving');

            if (data.success) {
              if (wrapper) {
                wrapper.classList.add('saved');
                setTimeout(function () {
                  wrapper.classList.remove('saved');
                }, 1200);
              }
              const displayTitle = data.title || (fieldName.replace(/_/g, ' ') + (newValue ? ' enabled' : ' disabled'));
              showQuickToast(data.message || (displayTitle + ' updated'), 'success');
            } else {
              // Revert
              self.checked = !newValue;
              updateToggleLabel(self);
              if (wrapper) {
                wrapper.classList.add('error');
                setTimeout(function () {
                  wrapper.classList.remove('error');
                }, 2200);
              }
              showQuickToast(data.error || 'Update failed', 'error');
            }
          })
          .catch(function (err) {
            if (wrapper) wrapper.classList.remove('saving');
            self.checked = !newValue;
            updateToggleLabel(self);
            if (wrapper) {
              wrapper.classList.add('error');
              setTimeout(function () {
                wrapper.classList.remove('error');
              }, 2200);
            }
            showQuickToast('Connection error while updating', 'error');
          });
      });

      updateToggleLabel(checkbox);
    });
  }

  // High-Speed AJAX for Order / Sort Inputs in Changelist
  function initListEditableInputs() {
    const changelist = document.getElementById('changelist') || document.querySelector('form#changelist-form');
    if (!changelist) return;

    changelist.querySelectorAll('input[type="number"], input[type="text"]').forEach(function (input) {
      if (input.classList.contains('action-select') || input.name === 'csrfmiddlewaretoken' || input.dataset.ajaxInputInitialized) return;
      if (!input.name || !input.name.startsWith('form-')) return;
      // Skip search inputs
      if (input.id === 'searchbar' || input.name === 'q') return;

      input.dataset.ajaxInputInitialized = 'true';
      input.dataset.originalVal = input.value;

      function saveInput() {
        if (input.value === input.dataset.originalVal) return;

        const row = input.closest('tr') || input.closest('.data-row') || input.closest('tbody');
        const objectId = getRowObjectId(row);
        const modelInfo = getModelInfo();
        const fieldName = input.name.replace(/^form-\d+-/, '');

        if (!modelInfo || !objectId || !fieldName) return;

        input.classList.remove('input-saved', 'input-error');
        input.classList.add('input-saving');

        const valToSend = input.value;

        fetch('/admin/quick-update/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({
            app_label: modelInfo.app_label,
            model_name: modelInfo.model_name,
            object_id: objectId,
            field_name: fieldName,
            value: valToSend
          })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            input.classList.remove('input-saving');
            if (data.success) {
              input.dataset.originalVal = valToSend;
              input.classList.add('input-saved');
              setTimeout(function () { input.classList.remove('input-saved'); }, 1400);
              showQuickToast(data.message || (fieldName + ' updated'), 'success');
            } else {
              input.value = input.dataset.originalVal;
              input.classList.add('input-error');
              setTimeout(function () { input.classList.remove('input-error'); }, 2000);
              showQuickToast(data.error || 'Failed to update', 'error');
            }
          })
          .catch(function () {
            input.classList.remove('input-saving');
            input.value = input.dataset.originalVal;
            input.classList.add('input-error');
            setTimeout(function () { input.classList.remove('input-error'); }, 2000);
            showQuickToast('Connection error while saving', 'error');
          });
      }

      input.addEventListener('change', saveInput);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveInput();
          input.blur();
        }
      });
    });
  }

  function startObserver() {
    var target = document.body || document.documentElement;
    if (!target || !(target instanceof Node)) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          startObserver();
        }, { once: true });
      }
      return;
    }
    var observer = new MutationObserver(function () {
      initToggles();
      initListEditableToggles();
      initListEditableInputs();
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  function initAll() {
    initToggles();
    initListEditableToggles();
    initListEditableInputs();
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();