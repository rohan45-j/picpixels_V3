/**
 * Service Admin Image Management & Auto-Alt Text Enhancer
 * PicPixels CMS
 * 
 * Features:
 * 1. Automatically populates image alt text using the uploaded image filename as default.
 * 2. Allows manual editing of alt text at any time.
 * 3. Provides live visual thumbnail previews and compact dropzones for file inputs.
 * 4. Automatically attaches to newly added inline formset rows.
 * 5. Dynamically toggles Portfolio vs Before & After fields in Gallery inline rows.
 */
(function() {
  'use strict';

  function formatAltFromFilename(filename) {
    if (!filename) return '';
    // Strip file extension
    var base = filename.replace(/\.[^/.]+$/, '');
    // Replace underscores and multiple dashes with single spaces
    var clean = base.replace(/[_-]+/g, ' ').trim();
    // Capitalize first letter
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }

  function findAssociatedAltInput(fileInput) {
    var name = fileInput.name || '';
    var id = fileInput.id || '';

    // 1. Exact ID mappings for main fields
    if (name === 'image' || id === 'id_image') {
      return document.getElementById('id_image_alt');
    }
    if (name === 'hero_background' || id === 'id_hero_background') {
      return document.getElementById('id_hero_image_alt');
    }

    // 2. Specific inline field pairings (before_image / after_image in gallery)
    var row = fileInput.closest('.form-row, tr.form-row, .inline-related, fieldset');
    if (!row) return null;

    if (name.indexOf('before_image') !== -1) {
      var beforeAlt = row.querySelector('input[name$="-before_image_alt"]');
      if (beforeAlt) return beforeAlt;
    }
    if (name.indexOf('after_image') !== -1) {
      var afterAlt = row.querySelector('input[name$="-after_image_alt"]');
      if (afterAlt) return afterAlt;
    }

    // 3. General inline alt fields in the same row
    var candidates = [
      'input[name$="-alt_text"]',
      'input[name$="-image_alt"]',
      'input[name$="-photo_alt"]'
    ];
    for (var i = 0; i < candidates.length; i++) {
      var input = row.querySelector(candidates[i]);
      if (input) return input;
    }

    return null;
  }

  function handleFileSelection(fileInput, file) {
    if (!file) return;

    var defaultAlt = formatAltFromFilename(file.name);
    var altInput = findAssociatedAltInput(fileInput);

    if (altInput) {
      // If alt input is empty, or previously was auto-filled, set default alt
      if (!altInput.value.trim() || altInput.dataset.autoFilled === 'true') {
        altInput.value = defaultAlt;
        altInput.dataset.autoFilled = 'true';
        altInput.dispatchEvent(new Event('input', { bubbles: true }));
        altInput.dispatchEvent(new Event('change', { bubbles: true }));

        showAutoAltBadge(altInput, file.name);
      }

      // If user manually edits the alt text, remove autoFilled mark
      if (!altInput._hasManualEditListener) {
        altInput.addEventListener('input', function() {
          altInput.dataset.autoFilled = 'false';
        });
        altInput._hasManualEditListener = true;
      }
    }

    updateLivePreview(fileInput, file);
  }

  function showAutoAltBadge(altInput, filename) {
    var wrap = altInput.parentNode;
    var existing = wrap.querySelector('.auto-alt-badge');
    if (existing) existing.remove();

    var badge = document.createElement('span');
    badge.className = 'auto-alt-badge';
    badge.innerHTML = '✓ Defaulted: <em>' + filename + '</em>';
    wrap.appendChild(badge);

    setTimeout(function() {
      badge.classList.add('fade-out');
      setTimeout(function() { if (badge.parentNode) badge.parentNode.removeChild(badge); }, 500);
    }, 4000);
  }

  function updateLivePreview(fileInput, file) {
    var name = (fileInput.name || '').toLowerCase();
    // Previews are strictly for Portfolio showcase images, not Before & After
    if (name.indexOf('before_image') !== -1 || name.indexOf('after_image') !== -1) {
      return;
    }

    var container = fileInput.closest('.img-enhancer-dropzone') || fileInput.parentNode;
    var previewWrap = container.querySelector('.live-img-preview-wrap');
    if (!previewWrap) {
      previewWrap = document.createElement('div');
      previewWrap.className = 'live-img-preview-wrap';
      container.appendChild(previewWrap);
    }

    var objUrl = URL.createObjectURL(file);
    var isInline = Boolean(fileInput.closest('td'));
    var sizeStr = (file.size / 1024 < 1024) 
      ? (file.size / 1024).toFixed(1) + ' KB' 
      : (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    if (isInline) {
      previewWrap.innerHTML =
        '<div class="live-img-mini-thumb">' +
          '<img src="' + objUrl + '" alt="' + file.name + '" title="' + file.name + ' (' + sizeStr + ')" />' +
          '<span class="live-img-mini-check">✓</span>' +
        '</div>';
    } else {
      previewWrap.innerHTML =
        '<div class="live-img-card">' +
          '<div class="live-img-thumb">' +
            '<img src="' + objUrl + '" alt="' + file.name + '" />' +
          '</div>' +
          '<div class="live-img-meta">' +
            '<span class="live-img-name" title="' + file.name + '">' + file.name + '</span>' +
            '<span class="live-img-size">' + sizeStr + '</span>' +
            '<span class="live-img-status">Ready to save</span>' +
          '</div>' +
        '</div>';
    }
  }

  function getRecommendedSize(fileInput) {
    var name = (fileInput.name || '').toLowerCase();
    var id = (fileInput.id || '').toLowerCase();
    var cell = fileInput.closest('td, .form-row, .fieldBox') || fileInput.parentNode;
    var cellClass = (cell && cell.className ? cell.className.toLowerCase() : '');
    var group = fileInput.closest('.inline-group, fieldset') || {};
    var groupId = (group.id ? group.id.toLowerCase() : '');

    // 1. Service Hero Background
    if (name === 'hero_background' || id === 'id_hero_background') {
      return '1600 × 1200 px (4:3)';
    }
    // 2. Service Thumbnail
    if (name === 'image' || id === 'id_image') {
      if (groupId.indexOf('gallery') === -1 && groupId.indexOf('hero') === -1) {
        return '800 × 600 px (4:3)';
      }
    }
    // 3. Service Hero Carousel Slides
    if (groupId.indexOf('heroimage') !== -1 || groupId.indexOf('hero_images') !== -1) {
      return '1600 × 1200 px (4:3)';
    }
    // 4. Gallery Images (Portfolio single, Before & After)
    if (
      groupId.indexOf('gallery') !== -1 ||
      cellClass.indexOf('field-before_image') !== -1 ||
      cellClass.indexOf('field-after_image') !== -1 ||
      name.indexOf('before_image') !== -1 ||
      name.indexOf('after_image') !== -1
    ) {
      return '1600 × 1200 px (4:3)';
    }
    // 5. Content Section Image
    if (groupId.indexOf('content_section') !== -1 || groupId.indexOf('contentsections') !== -1) {
      return '1200 × 800 px (3:2)';
    }
    // 6. Generic icons / diagrams
    if (name.indexOf('icon') !== -1 || cellClass.indexOf('icon') !== -1) {
      return '200 × 200 px (1:1)';
    }
    // Default fallback for any table image field in gallery
    if (cellClass.indexOf('field-image') !== -1) {
      return '1600 × 1200 px (4:3)';
    }
    return null;
  }

  function enhanceFileInput(fileInput) {
    if (fileInput._imgEnhanced) return;
    fileInput._imgEnhanced = true;

    // Only target image file inputs
    var isImage = fileInput.accept && fileInput.accept.indexOf('image') !== -1;
    var name = fileInput.name || '';
    if (!isImage && !/image|photo|thumbnail|background|file/i.test(name)) {
      return;
    }

    var isInline = Boolean(fileInput.closest('td'));
    var parent = fileInput.parentNode;
    var dropzone;

    // Don't re-wrap if already wrapped
    if (!parent.classList.contains('img-enhancer-dropzone')) {
      dropzone = document.createElement('div');
      dropzone.className = 'img-enhancer-dropzone' + (isInline ? ' img-enhancer-inline-dropzone' : '');
      parent.insertBefore(dropzone, fileInput);
      dropzone.appendChild(fileInput);

      ['dragenter', 'dragover'].forEach(function(evt) {
        dropzone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(function(evt) {
        dropzone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('drag-over');
        });
      });

      dropzone.addEventListener('drop', function(e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          var file = e.dataTransfer.files[0];
          try {
            var dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
          } catch(err) {}
          handleFileSelection(fileInput, file);
        }
      });
    } else {
      dropzone = parent;
    }

    // Attach concise Recommended Size badge
    var recSize = getRecommendedSize(fileInput);
    if (recSize && !dropzone.querySelector('.svc-size-badge')) {
      var badge = document.createElement('div');
      badge.className = 'svc-size-badge';
      badge.title = 'Recommended image dimensions for high quality display';
      badge.innerHTML = '<span class="svc-size-badge-icon">📐</span> Rec: ' + recSize;
      dropzone.appendChild(badge);
    }

    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFileSelection(fileInput, fileInput.files[0]);
      }
    });
  }

  /* ── Dynamic Gallery Inline Field Visibility ─────────── */

  function updateGalleryRowMode(tr) {
    if (!tr) return;
    var typeSelect = tr.querySelector('select[name$="-gallery_type"]');
    if (!typeSelect) return;

    var val = typeSelect.value;
    if (val === 'before_after') {
      tr.classList.remove('svc-row-portfolio');
      tr.classList.add('svc-row-before-after');
    } else {
      tr.classList.remove('svc-row-before-after');
      tr.classList.add('svc-row-portfolio');
    }
  }

  function initGalleryRowToggles() {
    var galleryGroup = document.getElementById('gallery_images-group');
    if (!galleryGroup) return;

    var rows = galleryGroup.querySelectorAll('tr.form-row, .tabular.inline-related tr');
    rows.forEach(function(tr) {
      updateGalleryRowMode(tr);
      var typeSelect = tr.querySelector('select[name$="-gallery_type"]');
      if (typeSelect && !typeSelect._hasGalleryToggleListener) {
        typeSelect.addEventListener('change', function() {
          updateGalleryRowMode(tr);
        });
        typeSelect._hasGalleryToggleListener = true;
      }
    });
  }

  function initAll() {
    var inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(function(inp) {
      enhanceFileInput(inp);
    });
    initGalleryRowToggles();
  }

  // Run on page ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Run when inlines are added dynamically
  if (typeof django !== 'undefined' && django.jQuery) {
    django.jQuery(document).on('formset:added', function(event, $row) {
      setTimeout(function() {
        if ($row && $row[0]) {
          var newInputs = $row[0].querySelectorAll('input[type="file"]');
          newInputs.forEach(enhanceFileInput);
          updateGalleryRowMode($row[0]);
          var typeSelect = $row[0].querySelector('select[name$="-gallery_type"]');
          if (typeSelect) {
            typeSelect.addEventListener('change', function() {
              updateGalleryRowMode($row[0]);
            });
          }
        } else {
          initAll();
        }
      }, 60);
    });
  }
})();
