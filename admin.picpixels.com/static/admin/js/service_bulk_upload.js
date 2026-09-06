/**
 * Service Admin — Enhanced Bulk Upload for Hero Slides, Gallery, and Before/After Pairs
 * PicPixels CMS
 */
(function () {
  'use strict';

  var ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
  var MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  /* ── Helpers ──────────────────────────────────────────── */

  function getCookie(name) {
    var v = document.cookie.match('(^|; )' + name + '=([^;]+)');
    return v ? v.pop() : '';
  }

  function showToast(msg, type) {
    var existing = document.querySelectorAll('.bulk-toast');
    existing.forEach(function (t) { if (t.parentNode) t.parentNode.removeChild(t); });

    var t = document.createElement('div');
    t.className = 'bulk-toast ' + (type || 'success');
    t.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '✓') + '</span> ' + msg;
    document.body.appendChild(t);
    setTimeout(function () {
      t.classList.add('hide');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 3500);
  }

  function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  /* ── Form Data Synchronization ────────────────────────── */

  function getBulkDataField() {
    var field = document.getElementById('id_bulk_uploads_json');
    if (!field) {
      field = document.createElement('textarea');
      field.id = 'id_bulk_uploads_json';
      field.name = 'bulk_uploads_json';
      field.style.display = 'none';
      var form = document.querySelector('#service_form') || document.querySelector('form') || document.forms[0];
      if (form) form.appendChild(field);
    }
    return field;
  }

  function getBulkData() {
    var field = getBulkDataField();
    if (!field || !field.value) return {};
    try { return JSON.parse(field.value); } catch (e) { return {}; }
  }

  function setBulkData(data) {
    var field = getBulkDataField();
    if (field) field.value = JSON.stringify(data);
    renderQueuedNotice();
  }

  function addBulkUploadEntry(type, fileUrl, extra) {
    var data = getBulkData();
    if (!data[type]) data[type] = [];
    var entry = { url: fileUrl };
    if (extra) {
      for (var k in extra) {
        if (extra.hasOwnProperty(k)) entry[k] = extra[k];
      }
    }
    data[type].push(entry);
    setBulkData(data);
  }

  function renderQueuedNotice() {
    var data = getBulkData();
    var heroCount = (data.hero_images || []).length;
    var galCount = (data.gallery_images || []).length;
    var baCount = (data.before_after_pairs || []).length;
    var total = heroCount + galCount + baCount;

    var existing = document.getElementById('svc-bulk-queued-banner');
    if (total === 0) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }

    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'svc-bulk-queued-banner';
      existing.className = 'svc-bulk-queued-banner';
      var container = document.getElementById('svc-tab-nav');
      if (container && container.nextElementSibling) {
        container.parentNode.insertBefore(existing, container.nextElementSibling);
      }
    }

    var parts = [];
    if (heroCount) parts.push(heroCount + ' hero slide' + (heroCount > 1 ? 's' : ''));
    if (galCount) parts.push(galCount + ' gallery image' + (galCount > 1 ? 's' : ''));
    if (baCount) parts.push(baCount + ' before/after pair' + (baCount > 1 ? 's' : ''));

    existing.innerHTML =
      '<div class="svc-queued-left">' +
        '<span class="svc-queued-icon">⚡</span>' +
        '<div>' +
          '<strong>' + total + ' bulk items ready to save:</strong> ' + parts.join(', ') + '.' +
          '<div class="svc-queued-sub">Click "Save" or "Save and continue editing" to persist them to this service.</div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="svc-queued-clear" id="svc-clear-queued-btn">Clear Queue</button>';

    var clearBtn = document.getElementById('svc-clear-queued-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        setBulkData({});
        showToast('Bulk upload queue cleared', 'info');
      });
    }
  }

  /* ── Modal Builder ────────────────────────────────────── */

  function createModal(title, subtitle) {
    var overlay = document.createElement('div');
    overlay.className = 'bulk-modal-overlay';
    overlay.innerHTML =
      '<div class="bulk-modal">' +
        '<div class="bulk-modal-header">' +
          '<div>' +
            '<h3 class="bulk-modal-title">' + title + '</h3>' +
            (subtitle ? '<div class="bulk-modal-subtitle">' + subtitle + '</div>' : '') +
          '</div>' +
          '<button class="bulk-modal-close" aria-label="Close" type="button">&times;</button>' +
        '</div>' +
        '<div class="bulk-modal-body"></div>' +
        '<div class="bulk-modal-footer">' +
          '<span class="bulk-footer-info">No files selected</span>' +
          '<div class="bulk-footer-actions">' +
            '<button type="button" class="bulk-btn bulk-btn-cancel">Cancel</button>' +
            '<button type="button" class="bulk-btn bulk-btn-upload" disabled>Start Upload</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.bulk-modal-close');
    var cancelBtn = overlay.querySelector('.bulk-btn-cancel');
    var uploadBtn = overlay.querySelector('.bulk-btn-upload');

    function close() {
      overlay.classList.remove('visible');
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
    }
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    return {
      overlay: overlay,
      body: overlay.querySelector('.bulk-modal-body'),
      info: overlay.querySelector('.bulk-footer-info'),
      uploadBtn: uploadBtn,
      close: close,
      open: function () {
        setTimeout(function () { overlay.classList.add('visible'); }, 10);
      }
    };
  }

  /* ── Single File Uploader via AJAX ─────────────────────── */

  function uploadFile(file, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      fd.append('file', file);

      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            var resp = JSON.parse(xhr.responseText);
            reject(new Error(resp.error || 'Upload error ' + xhr.status));
          } catch (err) {
            reject(new Error('Upload failed (HTTP ' + xhr.status + ')'));
          }
        }
      });

      xhr.addEventListener('error', function () { reject(new Error('Network connection error')); });
      xhr.open('POST', '/api/v1/cms/media/upload/');
      xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
      xhr.send(fd);
    });
  }

  /* ── Auto Order Calculation ───────────────────────────── */

  function getAutoOrder(prefix) {
    var maxOrder = 0;
    var inputs = document.querySelectorAll('#' + prefix + '-group input[name$="-order"]');
    inputs.forEach(function (inp) {
      var val = parseInt(inp.value, 10);
      if (!isNaN(val) && val >= maxOrder) maxOrder = val + 1;
    });
    return maxOrder;
  }

  /* ── 1. GALLERY BULK UPLOAD ───────────────────────────── */

  function initGalleryBulkUpload() {
    var group = document.getElementById('gallery_images-group');
    if (!group) return;

    var existingPanel = group.querySelector('.svc-bulk-actions-panel');
    if (existingPanel) return;

    var panel = document.createElement('div');
    panel.className = 'svc-bulk-actions-panel';
    panel.innerHTML =
      '<div class="svc-bulk-panel-left">' +
        '<span class="svc-bulk-panel-icon">⚡</span>' +
        '<div>' +
          '<h4 class="svc-bulk-panel-title">Bulk Image Management</h4>' +
          '<p class="svc-bulk-panel-desc">Upload multiple portfolio images or Before & After pairs. <span class="svc-bulk-rec-pill">📐 Recommended: 1600 × 1200 px (4:3)</span></p>' +
        '</div>' +
      '</div>' +
      '<div class="svc-bulk-panel-btns">' +
        '<button type="button" class="bulk-upload-trigger" id="btn-bulk-gallery">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          'Upload Portfolio Images' +
        '</button>' +
        '<button type="button" class="bulk-upload-trigger ba-trigger" id="btn-bulk-ba">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>' +
          'Upload Before & After Pairs' +
        '</button>' +
      '</div>';

    group.insertBefore(panel, group.querySelector('.tabular') || group.firstChild);

    document.getElementById('btn-bulk-gallery').addEventListener('click', openGalleryModal);
    document.getElementById('btn-bulk-ba').addEventListener('click', openBAModal);
  }

  function openGalleryModal() {
    var m = createModal('Bulk Upload Gallery Images', 'Select multiple images to add to this service portfolio or showcase.');
    var files = [];

    m.body.innerHTML =
      '<div class="bulk-size-banner">' +
        '<span class="bulk-size-pill">📐 Recommended Size: 1600 × 1200 px (4:3 aspect ratio)</span>' +
      '</div>' +
      '<div class="bulk-meta-bar">' +
        '<div class="bulk-meta-group">' +
          '<label>Gallery Section Type</label>' +
          '<select id="gal-type-select" class="bulk-select">' +
            '<option value="portfolio">Portfolio (Single showcase image)</option>' +
            '<option value="case_study">Case Study (Project image)</option>' +
            '<option value="before_after">Before & After</option>' +
          '</select>' +
        '</div>' +
        '<div class="bulk-meta-group">' +
          '<label>Category Tag (Applied to all)</label>' +
          '<input type="text" id="gal-cat-input" class="bulk-input" placeholder="e.g. Watch, Shoe, Jewelry, Apparel" />' +
        '</div>' +
      '</div>' +
      '<div class="bulk-dropzone" id="gal-dropzone">' +
        '<span class="bulk-dropzone-icon">📁</span>' +
        '<div class="bulk-dropzone-label"><strong>Click to browse</strong> or drag &amp; drop images here</div>' +
        '<div class="bulk-dropzone-sub"><strong>Recommended: 1600 × 1200 px (4:3)</strong> &bull; Supports JPG, PNG, WebP up to 25MB each.</div>' +
      '</div>' +
      '<div class="bulk-file-grid" id="gal-grid"></div>';

    var dz = m.body.querySelector('#gal-dropzone');
    var grid = m.body.querySelector('#gal-grid');
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.multiple = true;
    hiddenInput.accept = ACCEPTED_TYPES.join(',');
    hiddenInput.style.display = 'none';
    m.body.appendChild(hiddenInput);

    dz.addEventListener('click', function () { hiddenInput.click(); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('drag-over'); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault();
      dz.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });

    hiddenInput.addEventListener('change', function () {
      handleFiles(hiddenInput.files);
      hiddenInput.value = '';
    });

    function handleFiles(fileList) {
      Array.from(fileList).forEach(function (file) {
        if (ACCEPTED_TYPES.indexOf(file.type) === -1) {
          showToast(file.name + ': Unsupported format', 'error');
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          showToast(file.name + ': File exceeds 25MB', 'error');
          return;
        }
        var exists = files.some(function (f) { return f.file.name === file.name && f.file.size === file.size; });
        if (exists) return;

        files.push({
          file: file,
          status: 'ready',
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: ''
        });
      });
      renderList();
    }

    function renderList() {
      grid.innerHTML = '';
      files.forEach(function (entry, idx) {
        var card = document.createElement('div');
        card.className = 'bulk-file-card';
        card.dataset.idx = idx;

        var previewUrl = URL.createObjectURL(entry.file);
        card.innerHTML =
          '<div class="bulk-file-thumb-wrap">' +
            '<img src="' + previewUrl + '" alt="' + entry.file.name + '" />' +
            '<button type="button" class="bulk-remove-btn" title="Remove image">&times;</button>' +
          '</div>' +
          '<div class="bulk-file-details">' +
            '<div class="bulk-file-meta-row">' +
              '<span class="bulk-file-name" title="' + entry.file.name + '">' + entry.file.name + '</span>' +
              '<span class="bulk-file-size">' + formatBytes(entry.file.size) + '</span>' +
            '</div>' +
            '<input type="text" class="bulk-card-input alt" placeholder="Alt text / description" value="' + entry.altText + '" />' +
            '<input type="text" class="bulk-card-input caption" placeholder="Caption (optional)" value="' + entry.caption + '" />' +
            '<div class="bulk-progress-wrap" style="display:none;"><div class="bulk-progress-bar"></div></div>' +
            '<div class="bulk-status-msg"></div>' +
          '</div>';

        card.querySelector('.bulk-remove-btn').addEventListener('click', function () {
          files.splice(idx, 1);
          renderList();
        });

        card.querySelector('.bulk-card-input.alt').addEventListener('input', function (e) {
          entry.altText = e.target.value;
        });

        card.querySelector('.bulk-card-input.caption').addEventListener('input', function (e) {
          entry.caption = e.target.value;
        });

        grid.appendChild(card);
      });

      var readyCount = files.filter(function (f) { return f.status === 'ready'; }).length;
      m.info.textContent = readyCount + ' image' + (readyCount !== 1 ? 's' : '') + ' ready for upload';
      m.uploadBtn.disabled = readyCount === 0;
    }

    m.uploadBtn.addEventListener('click', function () {
      var readyFiles = files.filter(function (f) { return f.status === 'ready'; });
      if (readyFiles.length === 0) return;

      m.uploadBtn.disabled = true;
      m.uploadBtn.textContent = 'Uploading 0/' + readyFiles.length + '...';

      var galType = document.getElementById('gal-type-select').value;
      var sharedCat = document.getElementById('gal-cat-input').value.trim();
      var uploaded = 0;
      var failed = 0;
      var baseOrder = getAutoOrder('servicegalleryimage');

      readyFiles.forEach(function (entry) {
        var card = grid.querySelector('[data-idx="' + files.indexOf(entry) + '"]');
        var progWrap = card ? card.querySelector('.bulk-progress-wrap') : null;
        var progBar = card ? card.querySelector('.bulk-progress-bar') : null;
        var statusMsg = card ? card.querySelector('.bulk-status-msg') : null;

        if (progWrap) progWrap.style.display = 'block';

        uploadFile(entry.file, function (pct) {
          if (progBar) progBar.style.width = pct + '%';
        }).then(function (res) {
          entry.status = 'done';
          uploaded++;
          if (statusMsg) {
            statusMsg.textContent = '✓ Uploaded';
            statusMsg.className = 'bulk-status-msg success';
          }
          addBulkUploadEntry('gallery_images', res.url, {
            'gallery_type': galType,
            'category': sharedCat,
            'alt_text': entry.altText || '',
            'caption': entry.caption || '',
            'order': baseOrder + uploaded
          });
          checkFinish();
        }).catch(function (err) {
          entry.status = 'error';
          failed++;
          if (statusMsg) {
            statusMsg.textContent = '✗ ' + err.message;
            statusMsg.className = 'bulk-status-msg error';
          }
          checkFinish();
        });
      });

      function checkFinish() {
        m.uploadBtn.textContent = 'Uploading ' + (uploaded + failed) + '/' + readyFiles.length + '...';
        if (uploaded + failed >= readyFiles.length) {
          m.uploadBtn.textContent = 'Done!';
          showToast(uploaded + ' image' + (uploaded !== 1 ? 's' : '') + ' queued for save.', uploaded > 0 ? 'success' : 'error');
          setTimeout(function () { m.close(); }, 800);
        }
      }
    });

    m.open();
  }

  /* ── 2. BEFORE & AFTER PAIRS BULK UPLOAD ───────────────── */

  function openBAModal() {
    var m = createModal('Upload Before & After Pairs', 'Pair up images for interactive comparison sliders.');
    var beforeFiles = [];
    var afterFiles = [];
    var pairs = [];

    m.body.innerHTML =
      '<div class="bulk-size-banner">' +
        '<span class="bulk-size-pill">📐 Recommended Size: 1600 × 1200 px (4:3 aspect ratio) &bull; Both images must match dimensions</span>' +
      '</div>' +
      '<div class="ba-dual-dropzone-row">' +
        '<div class="ba-dz-col">' +
          '<div class="ba-dz-label"><span class="ba-pill before">Before</span> Source Images</div>' +
          '<div class="bulk-dropzone ba-sub-dz" id="ba-before-dz">' +
            '<div class="bulk-dropzone-label">Select <strong>Before</strong> images</div>' +
            '<div class="bulk-dropzone-sub">Recommended: 1600 × 1200 px (4:3)</div>' +
          '</div>' +
          '<div class="ba-mini-file-list" id="ba-before-list"></div>' +
        '</div>' +
        '<div class="ba-dz-col">' +
          '<div class="ba-dz-label"><span class="ba-pill after">After</span> Retouched Images</div>' +
          '<div class="bulk-dropzone ba-sub-dz" id="ba-after-dz">' +
            '<div class="bulk-dropzone-label">Select <strong>After</strong> images</div>' +
            '<div class="bulk-dropzone-sub">Recommended: 1600 × 1200 px (4:3)</div>' +
          '</div>' +
          '<div class="ba-mini-file-list" id="ba-after-list"></div>' +
        '</div>' +
      '</div>' +
      '<div class="ba-matched-section">' +
        '<h4 class="ba-matched-title">Matched Pairs</h4>' +
        '<div class="ba-pairs-grid" id="ba-pairs-grid">' +
          '<div class="ba-empty-hint">Drop Before and After images above to auto-match pairs by file name or order.</div>' +
        '</div>' +
      '</div>';

    var bDz = m.body.querySelector('#ba-before-dz');
    var aDz = m.body.querySelector('#ba-after-dz');
    var bInput = document.createElement('input');
    bInput.type = 'file'; bInput.multiple = true; bInput.accept = ACCEPTED_TYPES.join(',');
    var aInput = document.createElement('input');
    aInput.type = 'file'; aInput.multiple = true; aInput.accept = ACCEPTED_TYPES.join(',');

    bDz.addEventListener('click', function () { bInput.click(); });
    aDz.addEventListener('click', function () { aInput.click(); });

    bInput.addEventListener('change', function () {
      Array.from(bInput.files).forEach(function (f) { beforeFiles.push(f); });
      bInput.value = '';
      autoMatch();
    });

    aInput.addEventListener('change', function () {
      Array.from(aInput.files).forEach(function (f) { afterFiles.push(f); });
      aInput.value = '';
      autoMatch();
    });

    function cleanName(name) {
      return name.toLowerCase().replace(/[-_]?(before|after|raw|edit|retouch)[-_]?/g, '').replace(/\.[^/.]+$/, '');
    }

    function autoMatch() {
      pairs = [];
      var usedAfter = new Set();

      beforeFiles.forEach(function (bFile) {
        var bBase = cleanName(bFile.name);
        var match = null;

        for (var i = 0; i < afterFiles.length; i++) {
          if (!usedAfter.has(i) && cleanName(afterFiles[i].name) === bBase) {
            match = afterFiles[i];
            usedAfter.add(i);
            break;
          }
        }

        // If no exact name match, match by index
        if (!match) {
          for (var j = 0; j < afterFiles.length; j++) {
            if (!usedAfter.has(j)) {
              match = afterFiles[j];
              usedAfter.add(j);
              break;
            }
          }
        }

        if (match) {
          var bClean = bFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
          var aClean = match.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
          pairs.push({
            before: bFile,
            after: match,
            beforeAlt: bClean.length > 0 ? (bClean.charAt(0).toUpperCase() + bClean.slice(1)) : bFile.name,
            afterAlt: aClean.length > 0 ? (aClean.charAt(0).toUpperCase() + aClean.slice(1)) : match.name,
            caption: bBase.replace(/[-_]/g, ' ')
          });
        }
      });

      renderPairs();
    }

    function renderPairs() {
      var grid = m.body.querySelector('#ba-pairs-grid');
      grid.innerHTML = '';

      if (pairs.length === 0) {
        grid.innerHTML = '<div class="ba-empty-hint">Drop matching Before and After images to see paired previews.</div>';
        m.info.textContent = '0 pairs ready';
        m.uploadBtn.disabled = true;
        return;
      }

      pairs.forEach(function (pair, idx) {
        var card = document.createElement('div');
        card.className = 'ba-pair-card';
        card.innerHTML =
          '<div class="ba-pair-previews">' +
            '<div class="ba-thumb-box">' +
              '<span class="ba-thumb-tag">Before</span>' +
              '<img src="' + URL.createObjectURL(pair.before) + '" />' +
            '</div>' +
            '<div class="ba-thumb-box">' +
              '<span class="ba-thumb-tag">After</span>' +
              '<img src="' + URL.createObjectURL(pair.after) + '" />' +
            '</div>' +
          '</div>' +
          '<div class="ba-pair-details">' +
            '<div class="ba-alt-inputs">' +
              '<input type="text" class="bulk-card-input before-alt" placeholder="Before Alt Text" value="' + (pair.beforeAlt || '') + '" title="Alt text for Before image (defaults to filename, editable)" />' +
              '<input type="text" class="bulk-card-input after-alt" placeholder="After Alt Text" value="' + (pair.afterAlt || '') + '" title="Alt text for After image (defaults to filename, editable)" />' +
            '</div>' +
            '<input type="text" class="bulk-card-input caption" placeholder="Comparison caption (optional)" value="' + pair.caption + '" />' +
            '<button type="button" class="ba-remove-pair-btn" title="Remove pair">&times;</button>' +
          '</div>';

        card.querySelector('.ba-remove-pair-btn').addEventListener('click', function () {
          pairs.splice(idx, 1);
          renderPairs();
        });

        card.querySelector('.before-alt').addEventListener('input', function (e) {
          pair.beforeAlt = e.target.value;
        });

        card.querySelector('.after-alt').addEventListener('input', function (e) {
          pair.afterAlt = e.target.value;
        });

        card.querySelector('.caption').addEventListener('input', function (e) {
          pair.caption = e.target.value;
        });

        grid.appendChild(card);
      });

      m.info.textContent = pairs.length + ' comparison pair' + (pairs.length !== 1 ? 's' : '') + ' ready';
      m.uploadBtn.disabled = pairs.length === 0;
    }

    m.uploadBtn.addEventListener('click', function () {
      if (pairs.length === 0) return;
      m.uploadBtn.disabled = true;
      m.uploadBtn.textContent = 'Uploading pairs...';

      var uploaded = 0;
      var baseOrder = getAutoOrder('servicegalleryimage');

      var promises = pairs.map(function (pair, idx) {
        return uploadFile(pair.before, null).then(function (bData) {
          return uploadFile(pair.after, null).then(function (aData) {
            uploaded++;
            addBulkUploadEntry('before_after_pairs', bData.url, {
              'after_url': aData.url,
              'before_image_alt': pair.beforeAlt || '',
              'after_image_alt': pair.afterAlt || '',
              'caption': pair.caption || '',
              'order': baseOrder + idx + 1
            });
          });
        });
      });

      Promise.all(promises).then(function () {
        m.uploadBtn.textContent = 'Done!';
        showToast(uploaded + ' comparison pair' + (uploaded !== 1 ? 's' : '') + ' queued for save.');
        setTimeout(function () { m.close(); }, 700);
      }).catch(function (err) {
        showToast('Error during upload: ' + err.message, 'error');
        m.uploadBtn.disabled = false;
        m.uploadBtn.textContent = 'Retry Upload';
      });
    });

    m.open();
  }

  /* ── 3. HERO SLIDES BULK UPLOAD ───────────────────────── */

  function initHeroSlideBulkUpload() {
    var group = document.getElementById('serviceheroimage-group');
    if (!group) return;

    var existingBtn = group.querySelector('#btn-bulk-hero');
    if (existingBtn) return;

    var panel = document.createElement('div');
    panel.className = 'svc-bulk-actions-panel';
    panel.innerHTML =
      '<div class="svc-bulk-panel-left">' +
        '<span class="svc-bulk-panel-icon">🖼️</span>' +
        '<div>' +
          '<h4 class="svc-bulk-panel-title">Bulk Hero Carousel Slides</h4>' +
          '<p class="svc-bulk-panel-desc">Upload multiple slides for the hero carousel. <span class="svc-bulk-rec-pill">📐 Recommended: 1600 × 1200 px (4:3)</span></p>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="bulk-upload-trigger" id="btn-bulk-hero">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        'Upload Hero Slides' +
      '</button>';

    group.insertBefore(panel, group.querySelector('.tabular') || group.firstChild);

    document.getElementById('btn-bulk-hero').addEventListener('click', openHeroModal);
  }

  function openHeroModal() {
    var m = createModal('Bulk Upload Hero Slides', 'Images will be added to the hero slider carousel.');
    var files = [];

    m.body.innerHTML =
      '<div class="bulk-size-banner">' +
        '<span class="bulk-size-pill">📐 Recommended Size: 1600 × 1200 px (4:3 aspect ratio)</span>' +
      '</div>' +
      '<div class="bulk-dropzone" id="hero-dz">' +
        '<span class="bulk-dropzone-icon">🖼️</span>' +
        '<div class="bulk-dropzone-label"><strong>Click to browse</strong> or drag &amp; drop hero slides here</div>' +
        '<div class="bulk-dropzone-sub"><strong>Recommended: 1600 × 1200 px (4:3)</strong> &bull; Supports JPG, PNG, WebP up to 25MB each.</div>' +
      '</div>' +
      '<div class="bulk-file-grid" id="hero-grid"></div>';

    var dz = m.body.querySelector('#hero-dz');
    var grid = m.body.querySelector('#hero-grid');
    var input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept = ACCEPTED_TYPES.join(','); input.style.display = 'none';
    m.body.appendChild(input);

    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('drag-over'); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault();
      dz.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', function () {
      handleFiles(input.files);
      input.value = '';
    });

    function handleFiles(fileList) {
      Array.from(fileList).forEach(function (file) {
        if (ACCEPTED_TYPES.indexOf(file.type) === -1 || file.size > MAX_FILE_SIZE) return;
        files.push({ file: file, status: 'ready', altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') });
      });
      renderList();
    }

    function renderList() {
      grid.innerHTML = '';
      files.forEach(function (entry, idx) {
        var card = document.createElement('div');
        card.className = 'bulk-file-card';
        card.innerHTML =
          '<div class="bulk-file-thumb-wrap">' +
            '<img src="' + URL.createObjectURL(entry.file) + '" />' +
            '<button type="button" class="bulk-remove-btn">&times;</button>' +
          '</div>' +
          '<div class="bulk-file-details">' +
            '<span class="bulk-file-name">' + entry.file.name + '</span>' +
            '<input type="text" class="bulk-card-input alt" placeholder="Slide alt text" value="' + entry.altText + '" />' +
          '</div>';

        card.querySelector('.bulk-remove-btn').addEventListener('click', function () {
          files.splice(idx, 1);
          renderList();
        });

        card.querySelector('.bulk-card-input.alt').addEventListener('input', function (e) {
          entry.altText = e.target.value;
        });

        grid.appendChild(card);
      });

      var readyCount = files.filter(function (f) { return f.status === 'ready'; }).length;
      m.info.textContent = readyCount + ' hero slide' + (readyCount !== 1 ? 's' : '') + ' ready';
      m.uploadBtn.disabled = readyCount === 0;
    }

    m.uploadBtn.addEventListener('click', function () {
      var readyFiles = files.filter(function (f) { return f.status === 'ready'; });
      if (readyFiles.length === 0) return;

      m.uploadBtn.disabled = true;
      m.uploadBtn.textContent = 'Uploading...';
      var uploaded = 0;
      var baseOrder = getAutoOrder('serviceheroimage');

      var promises = readyFiles.map(function (entry, idx) {
        return uploadFile(entry.file, null).then(function (res) {
          uploaded++;
          addBulkUploadEntry('hero_images', res.url, {
            'alt_text': entry.altText || '',
            'order': baseOrder + idx + 1
          });
        });
      });

      Promise.all(promises).then(function () {
        m.uploadBtn.textContent = 'Done!';
        showToast(uploaded + ' hero slide' + (uploaded !== 1 ? 's' : '') + ' queued for save.');
        setTimeout(function () { m.close(); }, 700);
      }).catch(function (err) {
        showToast('Error: ' + err.message, 'error');
        m.uploadBtn.disabled = false;
        m.uploadBtn.textContent = 'Retry';
      });
    });

    m.open();
  }

  /* ── Initialization ───────────────────────────────────── */

  function init() {
    initHeroSlideBulkUpload();
    initGalleryBulkUpload();
    renderQueuedNotice();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof django !== 'undefined' && django.jQuery) {
    django.jQuery(document).on('formset:added', function () {
      setTimeout(init, 150);
    });
  }
})();
