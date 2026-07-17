(function() {
  'use strict';

  const BLOCK_META = {
    heading:          { icon: '📝', label: 'Heading' },
    text:             { icon: '📄', label: 'Text' },
    image:            { icon: '🖼️',  label: 'Image' },
    image_with_text:  { icon: '🖼️📝', label: 'Image with Text' },
    gallery:          { icon: '🖼️🖼️', label: 'Gallery' },
    code:             { icon: '💻',  label: 'Code' },
    callout:          { icon: '📦',  label: 'Callout Box' },
    faq:              { icon: '❓',  label: 'FAQ' },
    list:             { icon: '📋',  label: 'List' },
    table:            { icon: '📑',  label: 'Table' },
    step:             { icon: '🧩',  label: 'Steps' },
    divider:          { icon: '───', label: 'Divider' },
    stats:            { icon: '📊',  label: 'Stats' },
    quote:            { icon: '💬',  label: 'Quote' },
    cta:              { icon: '📢',  label: 'CTA' },
    full_width_image: { icon: '🌄',  label: 'Full-Width Image' },
  };

  let blocks = [];
  let inputEl = null;
  let containerEl = null;
  let expandedIndex = null;
  let pickerModal = null;

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') { e.className = attrs[k]; }
      else { e.setAttribute(k, attrs[k]); }
    }
    if (kids) for (var i = 0; i < kids.length; i++) {
      if (typeof kids[i] === 'string') e.appendChild(document.createTextNode(kids[i]));
      else e.appendChild(kids[i]);
    }
    return e;
  }

  function shortClean(text, n) {
    if (!text) return '';
    var t = text.replace(/<[^>]+>/g, '').trim();
    return t.length > n ? t.slice(0, n) + '…' : t;
  }

  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getTemplate(type) {
    var tpl = document.getElementById('cb-tpl-' + type);
    return tpl ? tpl.innerHTML : '<p>No template for ' + type + '</p>';
  }

  function createEmptyBlock(type) {
    switch (type) {
      case 'heading': return { type: 'heading', content: '', level: 2 };
      case 'text': return { type: 'text', content: '' };
      case 'image': return { type: 'image', src: '', alt: '', caption: '' };
      case 'image_with_text': return { type: 'image_with_text', src: '', alt: '', caption: '', text: '', layout: 'left' };
      case 'gallery': return { type: 'gallery', images: [{ src: '', alt: '', caption: '' }] };
      case 'code': return { type: 'code', content: '', language: '' };
      case 'callout': return { type: 'callout', style: 'info', title: '', content: '' };
      case 'faq': return { type: 'faq', question: '', answer: '' };
      case 'list': return { type: 'list', items: [''], ordered: false };
      case 'table': return { type: 'table', title: '', headers: [''], rows: [['']] };
      case 'step': return { type: 'step', title: '', content: '' };
      case 'stats': return { type: 'stats', stat_value: '', stat_label: '', stat_description: '' };
      case 'quote': return { type: 'quote', content: '', quote_author: '', quote_role: '' };
      case 'cta': return { type: 'cta', button_text: '', button_link: '', cta_description: '' };
      case 'full_width_image': return { type: 'full_width_image', src: '', alt: '', caption: '', alignment: 'full' };
      case 'divider': return { type: 'divider' };
      default: return { type: type };
    }
  }

  function getPreviewText(block) {
    var t = block.type;
    if (t === 'heading') return shortClean(block.content, 50);
    if (t === 'text') return shortClean(block.content, 50);
    if (t === 'image') return block.src ? '' : 'No image URL';
    if (t === 'full_width_image') return block.src ? '' : 'No image URL';
    if (t === 'image_with_text') return block.text ? shortClean(block.text, 40) : '';
    if (t === 'gallery') return (block.images || []).length + ' image(s)';
    if (t === 'code') return 'Code: ' + (block.language || 'plain');
    if (t === 'callout') return shortClean(block.title || block.content, 40);
    if (t === 'faq') return shortClean(block.question, 50);
    if (t === 'list') return (block.ordered ? 'Numbered' : 'Bullet') + ' · ' + (block.items || []).length + ' items';
    if (t === 'table') return (block.headers || []).length + ' cols × ' + (block.rows || []).length + ' rows';
    if (t === 'step') return shortClean(block.title, 40);
    if (t === 'stats') return (block.stat_value || '') + ' ' + (block.stat_label || '');
    if (t === 'quote') return shortClean(block.content, 50);
    if (t === 'cta') return block.button_text || '';
    if (t === 'divider') return '──────────────';
    return '';
  }

  function renderCard(index) {
    var block = blocks[index];
    var meta = BLOCK_META[block.type] || { icon: '❔', label: block.type };
    var isExpanded = expandedIndex === index;
    var previewText = getPreviewText(block);

    var card = el('div', { class: 'cbw-block', 'data-index': index.toString(), draggable: 'true' });
    if (isExpanded) card.classList.add('is-expanded');

    var header = el('div', { class: 'cbw-block-header' });

    var dragHandle = el('div', { class: 'cbw-drag' });
    dragHandle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg>';

    var iconEl = el('span', { class: 'cbw-block-icon' });
    iconEl.textContent = meta.icon;

    var labelEl = el('span', { class: 'cbw-block-label' });
    labelEl.textContent = meta.label;

    var orderEl = el('span', { class: 'cbw-block-order' });
    orderEl.textContent = '#' + (index + 1);

    var previewEl = el('span', { class: 'cbw-block-preview' });
    if (!isExpanded && previewText) {
      previewEl.textContent = previewText;
    }

    var actions = el('div', { class: 'cbw-block-actions' });

    var upBtn = el('button', { type: 'button', class: 'cbw-block-btn' });
    upBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>';
    upBtn.title = 'Move up';
    upBtn.addEventListener('click', function(e) { e.stopPropagation(); moveBlock(index, index - 1); });

    var downBtn = el('button', { type: 'button', class: 'cbw-block-btn' });
    downBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>';
    downBtn.title = 'Move down';
    downBtn.addEventListener('click', function(e) { e.stopPropagation(); moveBlock(index, index + 1); });

    var expandBtn = el('button', { type: 'button', class: 'cbw-block-btn' });
    expandBtn.innerHTML = isExpanded
      ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>'
      : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>';
    expandBtn.title = isExpanded ? 'Collapse' : 'Expand';
    expandBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleExpand(index); });

    var dupBtn = el('button', { type: 'button', class: 'cbw-block-btn' });
    dupBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
    dupBtn.title = 'Duplicate';
    dupBtn.addEventListener('click', function(e) { e.stopPropagation(); duplicateBlock(index); });

    var delBtn = el('button', { type: 'button', class: 'cbw-block-btn cbw-block-btn-danger' });
    delBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', function(e) { e.stopPropagation(); removeBlock(index); });

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(dupBtn);
    actions.appendChild(expandBtn);
    actions.appendChild(delBtn);

    header.appendChild(dragHandle);
    header.appendChild(iconEl);
    header.appendChild(labelEl);
    header.appendChild(orderEl);
    header.appendChild(previewEl);
    header.appendChild(actions);

    var body = el('div', { class: 'cbw-block-body' + (isExpanded ? '' : ' collapsed') });

    if (block.type !== 'divider') {
      var formHtml = getTemplate(block.type);
      formHtml = fillFormValues(formHtml, block);
      body.innerHTML = formHtml;
      populateDynamicFields(body, block);
      attachFieldListeners(body, index);
    }

    card.appendChild(header);
    card.appendChild(body);

    header.addEventListener('click', function(e) {
      if (e.target.closest('.cbw-block-actions, .cbw-drag')) return;
      toggleExpand(index);
    });

    var dragCount = 0;

    card.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
      dragCount = 0;
    });

    card.addEventListener('dragend', function() {
      card.classList.remove('dragging');
      document.querySelectorAll('.cbw-drop-indicator').forEach(function(el) { el.remove(); });
      dragCount = 0;
    });

    card.addEventListener('dragenter', function(e) {
      e.preventDefault();
      dragCount++;
      if (dragCount === 1) {
        document.querySelectorAll('.cbw-drop-indicator').forEach(function(el) { el.remove(); });
        var ind = el('div', { class: 'cbw-drop-indicator' });
        card.parentNode.insertBefore(ind, card.nextSibling);
      }
    });

    card.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });

    card.addEventListener('dragleave', function() {
      dragCount--;
      if (dragCount <= 0) {
        document.querySelectorAll('.cbw-drop-indicator').forEach(function(el) { el.remove(); });
        dragCount = 0;
      }
    });

    card.addEventListener('drop', function(e) {
      e.preventDefault();
      document.querySelectorAll('.cbw-drop-indicator').forEach(function(el) { el.remove(); });
      var from = parseInt(e.dataTransfer.getData('text/plain'));
      if (!isNaN(from) && from !== index) moveBlock(from, index);
    });

    return card;
  }

  function regexEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function fillFormValues(html, block) {
    for (var key in block) {
      if (key === 'type' || key === 'images' || key === 'items' || key === 'rows') continue;
      var val = block[key];
      if (key === 'headers' && Array.isArray(val)) val = val.join(', ');
      if (val === undefined || val === null) continue;
      var strVal = String(val);
      var safeKey = regexEscape(key);

      var inputRe = new RegExp('(<input[^>]*?data-field="' + safeKey + '"[^>]*?)(\\s*\\/?\\s*>)', 'g');
      html = html.replace(inputRe, function(m, before, close) {
        if (/type\s*=\s*"(?:checkbox|radio)"/i.test(before)) return m;
        before = before.replace(/\s+value="[^"]*"/g, '');
        return before + ' value="' + escapeHtml(strVal) + '" ' + close;
      });

      var taRe = new RegExp('(<textarea[^>]*data-field="' + safeKey + '"[^>]*>)\\s*</textarea>', 'g');
      html = html.replace(taRe, '$1' + escapeHtml(strVal) + '</textarea>');

      if (typeof val === 'boolean') {
        var cbRe = new RegExp('(<input[^>]*data-field="' + safeKey + '"[^>]*?)>', 'g');
        html = html.replace(cbRe, '$1' + (val ? ' checked' : '') + '>');
      }

      var radioRe = new RegExp('(<input[^>]*type="radio"[^>]*data-field="' + safeKey + '"[^>]*?value="' + regexEscape(escapeHtml(strVal)) + '"[^>]*?)>', 'g');
      html = html.replace(radioRe, '$1 checked>');

      var selRe = new RegExp('(<select[^>]*data-field="' + safeKey + '"[^>]*?>)([\\s\\S]*?)(<option[^>]*?value="' + regexEscape(escapeHtml(strVal)) + '"[^>]*?>)', 'g');
      html = html.replace(selRe, '$1$2$3 selected');
    }
    return html;
  }

  function populateDynamicFields(body, block) {
    if (Array.isArray(block.images) && block.images.length) {
      var list = body.querySelector('[data-list="images"]');
      if (list) {
        while (list.firstChild) list.removeChild(list.firstChild);
        block.images.forEach(function(img) {
          var item = el('div', { 'data-item': 'image', class: 'cbw-gallery-item' });
          if (img.src) {
            var prevWrap = el('div', { style: 'margin-bottom:4px' });
            var previewImg = el('img', { src: img.src, alt: '', style: 'max-width:100px;max-height:64px;border-radius:6px;border:1px solid var(--cbw-border);object-fit:cover;display:block' });
            prevWrap.appendChild(previewImg);
            item.appendChild(prevWrap);
          }
          var row = el('div', { class: 'cbw-gallery-row' });
          var srcInp = el('input', { type: 'text', 'data-field': 'src', value: img.src || '', class: 'cbw-input cbw-input-sm', placeholder: 'Image URL' });
          var altInp = el('input', { type: 'text', 'data-field': 'alt', value: img.alt || '', class: 'cbw-input cbw-input-sm', placeholder: 'Alt text' });
          var capInp = el('input', { type: 'text', 'data-field': 'caption', value: img.caption || '', class: 'cbw-input cbw-input-sm', placeholder: 'Caption' });
          var delBtn = el('button', { type: 'button', 'data-remove-btn': '', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
          delBtn.innerHTML = '&times;';
          row.appendChild(srcInp);
          row.appendChild(altInp);
          row.appendChild(capInp);
          row.appendChild(delBtn);
          item.appendChild(row);
          list.appendChild(item);
        });
      }
    }

    if (Array.isArray(block.items) && block.items.length) {
      var itemsList = body.querySelector('[data-list="items"]');
      if (itemsList) {
        while (itemsList.firstChild) itemsList.removeChild(itemsList.firstChild);
        block.items.forEach(function(text) {
          var item = el('div', { 'data-item': 'item', class: 'cbw-list-item' });
          var inp = el('input', { type: 'text', 'data-field': 'items[]', value: text || '', class: 'cbw-input', placeholder: 'Item text' });
          var delBtn = el('button', { type: 'button', 'data-action': 'remove-item', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
          delBtn.innerHTML = '&times;';
          item.appendChild(inp);
          item.appendChild(delBtn);
          itemsList.appendChild(item);
        });
      }
    }

    var columnsList = body.querySelector('[data-list="columns"]');
    if (columnsList) {
      while (columnsList.firstChild) columnsList.removeChild(columnsList.firstChild);
      var headers = Array.isArray(block.headers) ? block.headers : (block.headers ? String(block.headers).split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : []);
      headers.forEach(function(header, colIdx) {
        var colTag = el('span', { class: 'cbw-column-tag' });
        colTag.textContent = header || 'Column ' + (colIdx + 1);
        var removeBtn = el('button', { type: 'button', class: 'cbw-btn-icon cbw-btn-danger', style: 'width:20px;height:20px;font-size:0.65rem', title: 'Remove column', 'data-col-index': String(colIdx) });
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', function(e) {
          e.preventDefault(); e.stopPropagation();
          removeColumnAt(body, index, colIdx);
        });
        colTag.appendChild(removeBtn);
        columnsList.appendChild(colTag);
      });
    }

    if (Array.isArray(block.rows) && block.rows.length) {
      var rowsList = body.querySelector('[data-list="rows"]');
      if (rowsList) {
        while (rowsList.firstChild) rowsList.removeChild(rowsList.firstChild);
        block.rows.forEach(function(row) {
          var item = el('div', { 'data-item': 'row', class: 'cbw-table-row' });
          (row || []).forEach(function(cell) {
            var inp = el('input', { type: 'text', value: cell || '', class: 'cbw-input', placeholder: '...' });
            item.appendChild(inp);
          });
          var delBtn = el('button', { type: 'button', 'data-remove-btn': '', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
          delBtn.innerHTML = '&times;';
          item.appendChild(delBtn);
          rowsList.appendChild(item);
        });
      }
    }
  }

  function updateConditionalFields(body) {
    body.querySelectorAll('[data-show-if]').forEach(function(el) {
      var condition = el.getAttribute('data-show-if');
      var parts = condition.split(':');
      var srcField = parts[0];
      var expected = parts[1] || 'not-empty';
      var srcInput = body.querySelector('[data-field="' + srcField + '"]');
      if (srcInput) {
        var val = srcInput.value.trim();
        var show = expected === 'not-empty' ? val.length > 0 : val === expected;
        el.style.display = show ? '' : 'none';
      }
    });
  }

  function attachFieldListeners(body, index) {
    body.querySelectorAll('input[data-field], textarea[data-field]').forEach(function(field) {
      field.addEventListener('change', function() { onFieldChange(index); });
      field.addEventListener('input', function() { onFieldChange(index); });
    });
    body.querySelectorAll('select[data-field]').forEach(function(field) {
      field.addEventListener('change', function() { onFieldChange(index); });
    });
    updateConditionalFields(body);
    body.querySelectorAll('[data-action="add-gallery-image"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); addGalleryImage(body, index); });
    });
    body.querySelectorAll('[data-add-btn]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var target = btn.getAttribute('data-add-btn');
        var list = body.querySelector('[data-list="' + target + '"]');
        if (list) {
          var proto = list.querySelector('[data-proto]');
          if (proto) {
            var clone = proto.cloneNode(true);
            clone.removeAttribute('data-proto');
            var inputs = clone.querySelectorAll('input, textarea');
            inputs.forEach(function(inp) { inp.value = ''; });
            list.appendChild(clone);
          }
        }
        onFieldChange(index);
      });
    });
    body.querySelectorAll('[data-remove-btn]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        var item = btn.closest('[data-item]');
        if (item) {
          var parent = item.parentNode;
          if (parent.children.length > 1) item.remove();
        }
        onFieldChange(index);
      });
    });
    body.querySelectorAll('[data-action="add-item"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); addListItem(body, index); });
    });
    body.querySelectorAll('[data-action="remove-item"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); removeListItem(body, btn); });
    });
    body.querySelectorAll('[data-action="add-row"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); addTableRow(body, index); });
    });
    body.querySelectorAll('[data-action="remove-row"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); removeTableRow(body, btn); });
    });
    body.querySelectorAll('[data-action="add-column"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); addTableColumn(body, index); });
    });
    body.querySelectorAll('[data-action="remove-last-column"]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.preventDefault(); removeLastColumn(body, index); });
    });
  }

  function onFieldChange(index) {
    readBlockFromDOM(index);
    save();
    renderPreview(index);
    var card = containerEl.querySelector('[data-index="' + index + '"]');
    if (card) updateConditionalFields(card.querySelector('.cbw-block-body'));
  }

  function readBlockFromDOM(index) {
    var card = containerEl.querySelector('[data-index="' + index + '"]');
    if (!card) return;
    var body = card.querySelector('.cbw-block-body');
    if (!body) return;
    var block = blocks[index];

    body.querySelectorAll('[data-field]').forEach(function(field) {
      if (field.closest('[data-item]')) return;
      var key = field.getAttribute('data-field');
      var tag = field.tagName.toLowerCase();
      if (tag === 'input' && field.type === 'checkbox') {
        block[key] = field.checked;
      } else if (tag === 'input' && field.type === 'radio') {
        if (field.checked) block[key] = field.value;
      } else if (tag === 'select') {
        block[key] = field.value;
      } else {
        block[key] = field.value;
      }
    });

    var headersField = body.querySelector('[data-field="headers"]');
    if (headersField) {
      var hVal = headersField.value;
      block.headers = hVal ? hVal.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [''];
    }

    var listContainer = body.querySelector('[data-list="items"]');
    if (listContainer) {
      var items = [];
      listContainer.querySelectorAll('input[data-field="items[]"]').forEach(function(inp) {
        items.push(inp.value);
      });
      block.items = items.length ? items : [''];
    }

    var tableContainer = body.querySelector('[data-list="rows"]');
    if (tableContainer) {
      var rows = [];
      tableContainer.querySelectorAll('[data-item="row"]').forEach(function(rowEl) {
        var row = [];
        rowEl.querySelectorAll('input').forEach(function(inp) { row.push(inp.value); });
        rows.push(row);
      });
      block.rows = rows.length ? rows : [['']];
    }

    var galleryContainer = body.querySelector('[data-list="images"]');
    if (galleryContainer) {
      var images = [];
      galleryContainer.querySelectorAll('[data-item="image"]').forEach(function(imgEl) {
        var src = imgEl.querySelector('[data-field="src"]');
        var alt = imgEl.querySelector('[data-field="alt"]');
        var caption = imgEl.querySelector('[data-field="caption"]');
        images.push({
          src: src ? src.value : '',
          alt: alt ? alt.value : '',
          caption: caption ? caption.value : '',
        });
      });
      block.images = images.length ? images : [{ src: '', alt: '', caption: '' }];
    }
  }

  function renderPreview(index) {
    var card = containerEl.querySelector('[data-index="' + index + '"]');
    if (!card) return;
    var previewEl = card.querySelector('.cbw-block-preview');
    if (!previewEl) return;
    if (expandedIndex === index) {
      previewEl.textContent = '';
      return;
    }
    var text = getPreviewText(blocks[index]);
    previewEl.textContent = text;
  }

  function addListItem(body, index) {
    var list = body.querySelector('[data-list="items"]');
    if (!list) return;
    var item = el('div', { 'data-item': 'item', class: 'cbw-list-item' });
    var inp = el('input', { type: 'text', 'data-field': 'items[]', class: 'cbw-input', placeholder: 'Item text' });
    var delBtn = el('button', { type: 'button', 'data-action': 'remove-item', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
    delBtn.innerHTML = '&times;';
    item.appendChild(inp);
    item.appendChild(delBtn);
    list.appendChild(item);
    inp.addEventListener('input', function() { onFieldChange(index); });
    delBtn.addEventListener('click', function(e) { e.preventDefault(); removeListItem(body, delBtn); });
    onFieldChange(index);
  }

  function removeListItem(body, btn) {
    var item = btn.closest('[data-item]');
    if (item) {
      var list = item.parentNode;
      if (list.children.length > 1) item.remove();
    }
    var card = btn.closest('[data-index]');
    var index = card ? parseInt(card.getAttribute('data-index')) : 0;
    onFieldChange(index);
  }

  function addGalleryImage(body, index) {
    var list = body.querySelector('[data-list="images"]');
    if (!list) return;
    var item = el('div', { 'data-item': 'image', class: 'cbw-gallery-item' });
    var row = el('div', { class: 'cbw-gallery-row' });
    var srcInp = el('input', { type: 'text', 'data-field': 'src', value: '', class: 'cbw-input cbw-input-sm', placeholder: 'Image URL' });
    var altInp = el('input', { type: 'text', 'data-field': 'alt', value: '', class: 'cbw-input cbw-input-sm', placeholder: 'Alt text' });
    var capInp = el('input', { type: 'text', 'data-field': 'caption', value: '', class: 'cbw-input cbw-input-sm', placeholder: 'Caption' });
    var delBtn = el('button', { type: 'button', 'data-remove-btn': '', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
    delBtn.innerHTML = '&times;';
    row.appendChild(srcInp);
    row.appendChild(altInp);
    row.appendChild(capInp);
    row.appendChild(delBtn);
    item.appendChild(row);
    list.appendChild(item);
    srcInp.addEventListener('input', function() { onFieldChange(index); });
    altInp.addEventListener('input', function() { onFieldChange(index); });
    capInp.addEventListener('input', function() { onFieldChange(index); });
    delBtn.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var parent = item.parentNode;
      if (parent.children.length > 1) item.remove();
      onFieldChange(index);
    });
    onFieldChange(index);
  }

  function addTableRow(body, index) {
    var list = body.querySelector('[data-list="rows"]');
    if (!list) return;
    var cols = 1;
    var headerField = body.querySelector('[data-field="headers"]');
    if (headerField && headerField.value) {
      cols = headerField.value.split(',').length;
    } else {
      var existingRows = list.querySelectorAll('[data-item="row"]');
      if (existingRows.length > 0) {
        cols = existingRows[0].querySelectorAll('input').length;
      }
    }
    var row = el('div', { 'data-item': 'row', class: 'cbw-table-row' });
    for (var i = 0; i < cols; i++) {
      var inp = el('input', { type: 'text', class: 'cbw-input', placeholder: '...' });
      inp.addEventListener('input', function() { onFieldChange(index); });
      row.appendChild(inp);
    }
    var delBtn = el('button', { type: 'button', class: 'cbw-btn-icon cbw-btn-danger', title: 'Remove' });
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', function(e) { e.preventDefault(); removeTableRow(body, delBtn); });
    row.appendChild(delBtn);
    list.appendChild(row);
    onFieldChange(index);
  }

  function addTableColumn(body, index) {
    var headerField = body.querySelector('[data-field="headers"]');
    var list = body.querySelector('[data-list="rows"]');
    if (!list) return;

    var newHeader = 'Column ' + ((headerField && headerField.value ? headerField.value.split(',').length : 0) + 1);
    if (headerField) {
      var currentHeaders = headerField.value ? headerField.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];
      currentHeaders.push(newHeader);
      headerField.value = currentHeaders.join(', ');
    }

    list.querySelectorAll('[data-item="row"]').forEach(function(rowEl) {
      var inp = el('input', { type: 'text', class: 'cbw-input', placeholder: '...' });
      inp.addEventListener('input', function() { onFieldChange(index); });
      var delBtn = rowEl.querySelector('[data-remove-btn]');
      if (delBtn) rowEl.insertBefore(inp, delBtn);
      else rowEl.appendChild(inp);
    });

    if (list.querySelectorAll('[data-item="row"]').length === 0) {
      addTableRow(body, index);
    }

    refreshColumnsManager(body, index);
    onFieldChange(index);
  }

  function refreshColumnsManager(body, index) {
    var columnsList = body.querySelector('[data-list="columns"]');
    var headerField = body.querySelector('[data-field="headers"]');
    if (!columnsList || !headerField) return;

    while (columnsList.firstChild) columnsList.removeChild(columnsList.firstChild);
    var headers = headerField.value ? headerField.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];
    headers.forEach(function(header, colIdx) {
      var colTag = el('span', { class: 'cbw-column-tag' });
      colTag.textContent = header || 'Column ' + (colIdx + 1);
      var removeBtn = el('button', { type: 'button', class: 'cbw-btn-icon cbw-btn-danger', style: 'width:20px;height:20px;font-size:0.65rem', title: 'Remove column', 'data-col-index': String(colIdx) });
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        removeColumnAt(body, index, colIdx);
      });
      colTag.appendChild(removeBtn);
      columnsList.appendChild(colTag);
    });
  }

  function removeColumnAt(body, index, colIdx) {
    var headerField = body.querySelector('[data-field="headers"]');
    var list = body.querySelector('[data-list="rows"]');
    if (!headerField || !list) return;

    var headers = headerField.value ? headerField.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];
    if (headers.length <= 1) return;
    headers.splice(colIdx, 1);
    headerField.value = headers.join(', ');

    list.querySelectorAll('[data-item="row"]').forEach(function(rowEl) {
      var inputs = rowEl.querySelectorAll('input');
      if (inputs.length > colIdx) inputs[colIdx].remove();
    });

    refreshColumnsManager(body, index);
    onFieldChange(index);
  }

  function removeLastColumn(body, index) {
    var headerField = body.querySelector('[data-field="headers"]');
    var list = body.querySelector('[data-list="rows"]');
    if (!headerField || !list) return;

    var headers = headerField.value ? headerField.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];
    if (headers.length <= 1) return;
    headers.pop();
    headerField.value = headers.join(', ');

    list.querySelectorAll('[data-item="row"]').forEach(function(rowEl) {
      var inputs = rowEl.querySelectorAll('input');
      if (inputs.length > 0) inputs[inputs.length - 1].remove();
    });

    refreshColumnsManager(body, index);
    onFieldChange(index);
  }

  function removeTableRow(body, btn) {
    var item = btn.closest('[data-item="row"]');
    if (item) {
      var list = item.parentNode;
      if (list.children.length > 1) item.remove();
    }
    var card = btn.closest('[data-index]');
    var index = card ? parseInt(card.getAttribute('data-index')) : 0;
    onFieldChange(index);
  }

  function renderAll() {
    containerEl.innerHTML = '';
    if (blocks.length === 0) {
      var empty = el('div', { class: 'cbw-empty' });
      var iconDiv = el('div', { class: 'cbw-empty-icon' });
      iconDiv.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
      var title = el('p', { class: 'cbw-empty-title' });
      title.textContent = 'No content blocks yet';
      var sub = el('p', { class: 'cbw-empty-sub' });
      sub.textContent = 'Click "Add Block" to start building your page content.';
      empty.appendChild(iconDiv);
      empty.appendChild(title);
      empty.appendChild(sub);
      containerEl.appendChild(empty);
      return;
    }
    blocks.forEach(function(block, i) {
      var card = renderCard(i);
      containerEl.appendChild(card);
    });
    save();
  }

  function toggleExpand(index) {
    if (expandedIndex === index) {
      expandedIndex = null;
    } else {
      expandedIndex = index;
    }
    renderAll();
    if (expandedIndex !== null) {
      var card = containerEl.querySelector('[data-index="' + expandedIndex + '"]');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function duplicateBlock(index) {
    var block = JSON.parse(JSON.stringify(blocks[index]));
    blocks.splice(index + 1, 0, block);
    expandedIndex = index + 1;
    renderAll();
    var cards = containerEl.querySelectorAll('.cbw-block');
    if (cards[expandedIndex]) setTimeout(function() { cards[expandedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
  }

  function addBlock(type) {
    var block = createEmptyBlock(type);
    blocks.push(block);
    expandedIndex = blocks.length - 1;
    renderAll();
    var newCard = containerEl.lastChild;
    if (newCard) setTimeout(function() { newCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
  }

  function removeBlock(index) {
    if (blocks.length <= 1) {
      blocks = [];
      expandedIndex = null;
      renderAll();
      return;
    }
    blocks.splice(index, 1);
    if (expandedIndex === index) expandedIndex = null;
    else if (expandedIndex > index) expandedIndex--;
    renderAll();
  }

  function moveBlock(from, to) {
    if (from === to) return;
    if (to < 0 || to >= blocks.length) return;
    var block = blocks.splice(from, 1)[0];
    blocks.splice(to, 0, block);
    if (expandedIndex === from) {
      expandedIndex = to;
    } else if (expandedIndex !== null) {
      if (from < to) {
        if (expandedIndex > from && expandedIndex <= to) expandedIndex--;
      } else {
        if (expandedIndex >= to && expandedIndex < from) expandedIndex++;
      }
    }
    renderAll();
  }

  function save() {
    inputEl.value = JSON.stringify(blocks);
    var evt = new Event('change', { bubbles: true });
    inputEl.dispatchEvent(evt);
  }

  function openPicker() {
    if (!pickerModal) return;
    pickerModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closePicker() {
    if (!pickerModal) return;
    pickerModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.ContentBlocksBuilder = {
    init: function(inputId, data) {
      inputEl = document.getElementById(inputId);
      if (!inputEl) return;
      containerEl = document.getElementById('cb-cards-container');
      if (!containerEl) return;
      pickerModal = document.getElementById('cb-picker-modal');

      blocks = Array.isArray(data) ? JSON.parse(JSON.stringify(data)) : [];

      renderAll();

      var addBtn = document.getElementById('cb-add-btn');
      if (addBtn) addBtn.addEventListener('click', openPicker);

      var closeBtn = document.getElementById('cb-picker-close');
      if (closeBtn) closeBtn.addEventListener('click', closePicker);

      pickerModal?.querySelectorAll('[data-pick-type]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var type = btn.getAttribute('data-pick-type');
          addBlock(type);
          closePicker();
        });
      });

      pickerModal?.addEventListener('click', function(e) {
        if (e.target === pickerModal) closePicker();
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePicker();
      });
    }
  };
})();
