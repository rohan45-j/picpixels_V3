(function () {
  'use strict';

  var toggleBtns = document.querySelectorAll('.password-toggle');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var input = document.getElementById(btn.getAttribute('data-toggle'));
      if (!input) return;
      var isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      var eyeOpen = btn.querySelector('.eye-open');
      var eyeClosed = btn.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';
      }
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
    });
  });

  var loginForm = document.getElementById('login-form');
  var submitBtn = document.getElementById('login-submit-btn');
  if (loginForm && submitBtn) {
    loginForm.addEventListener('submit', function () {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    });
  }
})();
