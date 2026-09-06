/**
 * Title Word Highlighter — Interactive Word-Level Coloring Tool for Admin
 * PicPixels CMS
 */
(function() {
  'use strict';

  var TITLE_SELECTORS = [
    'input[name="title"]',
    'input[name="hero_title"]',
    'input[name="why_choose_title"]',
    'input[name="why_need_section_title"]',
    'input[name="process_section_title"]',
    'input[name="overview_title"]',
    'input[name="pricing_heading"]',
    'input[name="review_title"]',
    'input[name="faq_title"]',
    'input[name$="-heading"]'
  ];

  var SWATCH_COLORS = [
    { name: 'Brand Orange', hex: '#FF8A50', isBrand: true },
    { name: 'Royal Blue', hex: '#2563EB', isBrand: false },
    { name: 'Emerald Green', hex: '#10B981', isBrand: false },
    { name: 'Crimson Red', hex: '#EF4444', isBrand: false },
    { name: 'Purple Violet', hex: '#8B5CF6', isBrand: false },
    { name: 'Amber Gold', hex: '#F59E0B', isBrand: false },
    { name: 'Solid Black', hex: '#000000', isBrand: false }
  ];

  function parseHighlightedWords(rawText) {
    if (!rawText) return [];
    // Match custom colors {#HEX}text{/#}, brand {text}, markdown *text*, and plain text
    var pattern = /(?:\{color:([#a-zA-Z0-9]+)\}(.*?)\{\/color\})|(?:\{(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[a-zA-Z]+))\}(.*?)\{\/#?\})|(?:\[color[:=]([#a-zA-Z0-9]+)\](.*?)\[\/color\])|(?:<span\s+style=["'][^"']*color:\s*([^"';]+)[^"']*["']>(.*?)<\/span>)|(?:\{([^{}\r\n]+)\})|(?:\*{1,2}([^*\r\n]+)\*{1,2})/gi;

    var tokens = [];
    var lastIdx = 0;
    var match;

    while ((match = pattern.exec(rawText)) !== null) {
      if (match.index > lastIdx) {
        var plain = rawText.substring(lastIdx, match.index);
        tokens.push({ text: plain, color: null });
      }

      var color = match[1] || match[3] || match[5] || match[7];
      var text = match[2] || match[4] || match[6] || match[8] || match[9] || match[10];
      var isBrand = Boolean(match[9] || match[10]);

      tokens.push({
        text: text,
        color: isBrand ? '#FF8A50' : (color || '#FF8A50'),
        rawMatch: match[0],
        matchIndex: match.index,
        matchLength: match[0].length
      });

      lastIdx = pattern.lastIndex;
    }

    if (lastIdx < rawText.length) {
      tokens.push({ text: rawText.substring(lastIdx), color: null });
    }

    return tokens;
  }

  function renderPreviewHtml(rawText, baseColor) {
    if (!rawText) return '<span style="color:#94a3b8;font-style:italic;">No title entered</span>';
    var tokens = parseHighlightedWords(rawText);
    var html = '';
    tokens.forEach(function(token) {
      var esc = token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (token.color) {
        html += '<span style="color:' + token.color + ';font-weight:800;text-shadow:0 0 1px rgba(0,0,0,0.1);">' + esc + '</span>';
      } else {
        html += '<span style="color:' + (baseColor || '#0f172a') + ';">' + esc + '</span>';
      }
    });
    return html;
  }

  function getBaseColorForInput(input) {
    // Try to find paired color picker in the same form-row or nearby
    var row = input.closest('.form-row') || input.parentElement;
    if (row) {
      var colorInput = row.querySelector('input[name$="_color"]');
      if (colorInput && colorInput.value) {
        return colorInput.value;
      }
    }
    return '#000000';
  }

  function applyHighlightToSelection(input, colorHex, isBrand) {
    var start = input.selectionStart;
    var end = input.selectionEnd;
    var val = input.value;

    if (start === end) {
      // Nothing selected: find word under cursor or last word
      var words = val.trim().split(/\s+/);
      if (!words.length || !val.trim()) return;
      var lastWord = words[words.length - 1];
      var idx = val.lastIndexOf(lastWord);
      start = idx;
      end = idx + lastWord.length;
    }

    var selected = val.substring(start, end);
    // Strip existing braces or tags inside selection
    selected = selected.replace(/\{#?[^}]*\}/g, '').replace(/\{\/#?\}/g, '');
    if (!selected.trim()) return;

    var wrapped = isBrand ? ('{' + selected + '}') : ('{' + colorHex + '}' + selected + '{/#}');
    input.value = val.substring(0, start) + wrapped + val.substring(end);

    // Trigger change / input event
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    input.focus();
    input.setSelectionRange(start, start + wrapped.length);
  }

  function clearAllHighlights(input) {
    var val = input.value;
    // Strip all highlight tags while preserving word text
    val = val.replace(/\{color:[^}]+\}(.*?)\{\/color\}/gi, '$1')
             .replace(/\{#[^}]+\}(.*?)\{\/#?\}/gi, '$1')
             .replace(/\[color[^\]]*\](.*?)\[\/color\]/gi, '$1')
             .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
             .replace(/\{([^{}]+)\}/g, '$1')
             .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
    input.value = val;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function initInputHighlighter(input) {
    if (input.dataset.highlighterInit === 'true') return;
    input.dataset.highlighterInit = 'true';

    // Create container
    var widgetWrap = document.createElement('div');
    widgetWrap.className = 'title-word-highlighter-wrap';

    // 1. Toolbar Row
    var toolbar = document.createElement('div');
    toolbar.className = 'twh-toolbar';

    var toolLabel = document.createElement('span');
    toolLabel.className = 'twh-tool-label';
    toolLabel.innerHTML = '🎨 <strong>Highlight Word:</strong> <span class="twh-help-text">Select any word(s) above, then pick color:</span>';
    toolbar.appendChild(toolLabel);

    var btnGroup = document.createElement('div');
    btnGroup.className = 'twh-btn-group';

    // Swatches
    SWATCH_COLORS.forEach(function(swatch) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'twh-swatch-btn';
      btn.title = 'Highlight selected word with ' + swatch.name + ' (' + swatch.hex + ')';
      btn.style.backgroundColor = swatch.hex;
      if (swatch.hex === '#000000') {
        btn.style.borderColor = '#94a3b8';
      }

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        applyHighlightToSelection(input, swatch.hex, swatch.isBrand);
        updateUI();
      });

      btnGroup.appendChild(btn);
    });

    // Custom Color Wheel Picker
    var customPickerWrap = document.createElement('label');
    customPickerWrap.className = 'twh-custom-picker-label';
    customPickerWrap.title = 'Choose any custom HEX color for selected word';

    var customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.value = '#FF8A50';
    customColorInput.className = 'twh-color-input';

    customColorInput.addEventListener('change', function() {
      applyHighlightToSelection(input, customColorInput.value, false);
      updateUI();
    });

    customPickerWrap.appendChild(customColorInput);
    customPickerWrap.appendChild(document.createTextNode('Custom ▾'));
    btnGroup.appendChild(customPickerWrap);

    // Clear Button
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'twh-clear-btn';
    clearBtn.title = 'Remove highlight tags from title';
    clearBtn.innerHTML = '✕ Clear Tags';
    clearBtn.addEventListener('click', function(e) {
      e.preventDefault();
      clearAllHighlights(input);
      updateUI();
    });
    btnGroup.appendChild(clearBtn);

    toolbar.appendChild(btnGroup);
    widgetWrap.appendChild(toolbar);

    // 2. Clickable Word Chips Container
    var chipsContainer = document.createElement('div');
    chipsContainer.className = 'twh-chips-bar';
    widgetWrap.appendChild(chipsContainer);

    // 3. Live Preview Banner
    var previewBanner = document.createElement('div');
    previewBanner.className = 'twh-preview-banner';

    var previewLabel = document.createElement('span');
    previewLabel.className = 'twh-preview-label';
    previewLabel.textContent = 'Live Site Preview:';

    var previewText = document.createElement('span');
    previewText.className = 'twh-preview-text';

    previewBanner.appendChild(previewLabel);
    previewBanner.appendChild(previewText);
    widgetWrap.appendChild(previewBanner);

    // Insert widgetWrap directly after input (or after its immediate parent if inside a wrapper)
    var parent = input.parentElement;
    if (parent.classList.contains('color-picker-controls') || parent.classList.contains('modern-color-picker-wrap')) {
      parent = parent.parentElement;
    }
    parent.appendChild(widgetWrap);

    function updateUI() {
      var rawVal = input.value || '';
      var baseColor = getBaseColorForInput(input);

      // 1. Update Preview
      previewText.innerHTML = renderPreviewHtml(rawVal, baseColor);

      // 2. Update Clickable Word Chips
      chipsContainer.innerHTML = '';
      if (!rawVal.trim()) {
        chipsContainer.style.display = 'none';
        return;
      }
      chipsContainer.style.display = 'flex';

      var words = rawVal.split(/(\s+)/); // Keep spaces
      var charPos = 0;

      words.forEach(function(part) {
        if (!part.trim()) {
          charPos += part.length;
          return;
        }

        var partStart = charPos;
        var partEnd = charPos + part.length;
        charPos = partEnd;

        // Check if this part has tags
        var isTagWord = /\{#?[^}]*\}/.test(part) || /\{\/#?\}/.test(part);
        var cleanWord = part.replace(/\{#?[^}]*\}/g, '').replace(/\{\/#?\}/g, '');
        if (!cleanWord) return;

        var tokenColor = null;
        var tagMatch = part.match(/\{(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[a-zA-Z]+))\}/);
        if (tagMatch) {
          tokenColor = tagMatch[1];
        } else if (/\{[^{}]+\}/.test(part)) {
          tokenColor = '#FF8A50'; // Brand orange
        }

        var chip = document.createElement('span');
        chip.className = 'twh-word-chip' + (tokenColor ? ' active-highlight' : '');
        chip.title = 'Click to select and color "' + cleanWord + '"';

        if (tokenColor) {
          var dot = document.createElement('span');
          dot.className = 'twh-chip-dot';
          dot.style.backgroundColor = tokenColor;
          chip.appendChild(dot);
        }

        var label = document.createElement('span');
        label.textContent = cleanWord;
        chip.appendChild(label);

        chip.addEventListener('click', function(e) {
          e.preventDefault();
          input.focus();
          input.setSelectionRange(partStart, partEnd);
        });

        chipsContainer.appendChild(chip);
      });
    }

    input.addEventListener('input', updateUI);
    input.addEventListener('change', updateUI);

    // Also update if adjacent color picker changes
    var row = input.closest('.form-row') || input.parentElement;
    if (row) {
      var colorInput = row.querySelector('input[name$="_color"]');
      if (colorInput) {
        colorInput.addEventListener('input', updateUI);
        colorInput.addEventListener('change', updateUI);
      }
    }

    // Initial render
    updateUI();
  }

  function initAll() {
    TITLE_SELECTORS.forEach(function(selector) {
      document.querySelectorAll(selector).forEach(function(input) {
        // Skip hidden inputs or inputs inside search bars
        if (input.type === 'hidden' || input.closest('#changelist-search')) return;
        initInputHighlighter(input);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Handle dynamically added formsets
  document.addEventListener('formset:added', function() {
    setTimeout(initAll, 100);
  });
})();
