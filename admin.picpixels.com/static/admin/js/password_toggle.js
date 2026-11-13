/**
 * PicPixels Admin — Password Visibility Toggle
 * Automatically adds a modern, interactive Show/Hide Password eye toggle
 * to all password fields across the admin (User Add, Password Change, Login, etc.).
 */
(function () {
  'use strict';

  var EYE_SVG = '<svg class="pwd-eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>' +
    '<circle cx="12" cy="12" r="3"/>' +
    '</svg>';

  var EYE_OFF_SVG = '<svg class="pwd-eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>' +
    '<line x1="1" y1="1" x2="23" y2="23"/>' +
    '</svg>';

  function initPasswordField(input) {
    if (!input || input.dataset.pwdToggleInit === 'true') return;
    if (input.type !== 'password' && input.dataset.originalType !== 'password') return;

    input.dataset.pwdToggleInit = 'true';
    input.dataset.originalType = 'password';

    // Wrap input in a relative positioned container if not already in one
    var parent = input.parentElement;
    var wrapper = document.createElement('div');
    wrapper.className = 'password-toggle-wrapper';
    
    // Insert wrapper before input and move input inside
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Give input extra padding on right so typed text never collides with icon
    input.classList.add('pwd-input-padded');

    // Create the eye toggle button
    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'pwd-toggle-btn';
    toggleBtn.tabIndex = -1; // Keep tab navigation linear between inputs
    toggleBtn.setAttribute('aria-label', 'Show password');
    toggleBtn.setAttribute('title', 'Show password');
    toggleBtn.innerHTML = '<span class="pwd-icon-show">' + EYE_SVG + '</span><span class="pwd-icon-hide" style="display:none;">' + EYE_OFF_SVG + '</span>';

    wrapper.appendChild(toggleBtn);

    // Toggle click handler
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      var showIcon = toggleBtn.querySelector('.pwd-icon-show');
      var hideIcon = toggleBtn.querySelector('.pwd-icon-hide');

      if (isPassword) {
        // Now visible
        showIcon.style.display = 'none';
        hideIcon.style.display = 'inline-flex';
        toggleBtn.setAttribute('aria-label', 'Hide password');
        toggleBtn.setAttribute('title', 'Hide password');
        toggleBtn.classList.add('is-active');
      } else {
        // Now hidden
        showIcon.style.display = 'inline-flex';
        hideIcon.style.display = 'none';
        toggleBtn.setAttribute('aria-label', 'Show password');
        toggleBtn.setAttribute('title', 'Show password');
        toggleBtn.classList.remove('is-active');
      }

      // Preserve cursor position at end of text
      try {
        var valLen = input.value.length;
        input.setSelectionRange(valLen, valLen);
        input.focus();
      } catch (err) {}
    });
  }

  function scanAndInit() {
    var passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(initPasswordField);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInit);
  } else {
    scanAndInit();
  }

  // Handle dynamically rendered inputs / tabs via MutationObserver
  var observer = new MutationObserver(function () {
    scanAndInit();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
