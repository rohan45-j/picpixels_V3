(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initStickyFooter();
    initCollapseButtons();
    initImagePreview();
  });

  function initStickyFooter() {
    var footer = document.getElementById('bpa-sticky-footer');
    if (!footer) return;

    /* Add padding to bottom of content so footer doesn't overlap */
    var content = document.getElementById('content-main');
    if (content) {
      var footerHeight = footer.offsetHeight;
      content.style.paddingBottom = (footerHeight + 24) + 'px';
    }

    /* Observe sidebar state changes */
    var sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      var observer = new MutationObserver(function() {
        if (sidebar.classList.contains('collapsed')) {
          footer.classList.add('sidebar-collapsed');
        } else {
          footer.classList.remove('sidebar-collapsed');
        }
      });
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

      /* Initial check */
      if (sidebar.classList.contains('collapsed')) {
        footer.classList.add('sidebar-collapsed');
      }
    }
  }

  function initCollapseButtons() {
    document.querySelectorAll('.bpa-collapse-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.bpa-card');
        if (!card) return;

        var body = card.querySelector('.bpa-card-body');
        if (!body) return;

        btn.classList.toggle('is-collapsed');
        body.classList.toggle('is-collapsed');

        /* Store state */
        var key = 'bpa_collapsed_' + (btn.getAttribute('data-collapse') || 'section');
        if (body.classList.contains('is-collapsed')) {
          try { localStorage.setItem(key, '1'); } catch(e) {}
        } else {
          try { localStorage.removeItem(key); } catch(e) {}
        }
      });

      /* Restore previous state from localStorage */
      var key = 'bpa_collapsed_' + (btn.getAttribute('data-collapse') || 'section');
      try {
        if (localStorage.getItem(key) === '1') {
          btn.click();
        }
      } catch(e) {}
    });
  }

  function initImagePreview() {
    /* Enhance file input previews for featured_image and hero_image */
    document.querySelectorAll('.field-featured_image input[type="file"], .field-hero_image input[type="file"]').forEach(function(input) {
      var wrapper = input.closest('.form-row') || input.closest('.admin-form-group');
      if (!wrapper) return;

      /* Create or find image preview container */
      var preview = wrapper.querySelector('.bpa-image-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.className = 'bpa-image-preview';
        preview.style.cssText = 'margin-top:8px';
        input.parentNode.insertBefore(preview, input.nextSibling);
      }

      /* Find existing preview image */
      var existingImg = wrapper.querySelector('img');
      if (existingImg) {
        preview.innerHTML = '';
        var imgClone = existingImg.cloneNode();
        preview.appendChild(imgClone);
        existingImg.style.display = 'none';
        /* Wrap in dropzone */
        preview.className = 'bpa-image-preview bpa-image-dropzone has-image';
      } else {
        preview.className = 'bpa-image-preview bpa-image-dropzone';
        preview.innerHTML = '<div class="bpa-image-dropzone-text">Drop an image here or <strong>browse</strong> to upload</div>';
      }

      /* Update preview on file selection */
      input.addEventListener('change', function() {
        var file = input.files && input.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(e) {
            preview.innerHTML = '';
            var img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'max-width:100%;max-height:200px;border-radius:8px;object-fit:cover';
            preview.appendChild(img);
            preview.className = 'bpa-image-preview bpa-image-dropzone has-image';
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
})();
