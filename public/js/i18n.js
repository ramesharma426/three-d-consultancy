(function () {
  var STORAGE_KEY = 'lang';

  function applyLang(lang) {
    document.querySelectorAll('[data-i18n-en]').forEach(function (el) {
      el.hidden = lang !== 'en';
    });
    document.querySelectorAll('[data-i18n-ne]').forEach(function (el) {
      el.hidden = lang !== 'ne';
    });
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === lang));
    });
  }

  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    /* localStorage unavailable (private mode, etc.) — fall back to default */
  }
  applyLang(saved === 'ne' ? 'ne' : 'en');

  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang-btn');
      applyLang(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        /* ignore */
      }
    });
  });
})();
