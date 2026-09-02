(function () {
  var triggers = document.querySelectorAll('[data-lightbox-src]');
  if (triggers.length === 0) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('data-lenis-prevent', '');
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
    '<img class="lightbox-img" alt="">';
  document.body.appendChild(overlay);

  var img = overlay.querySelector('.lightbox-img');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    img.src = trigger.getAttribute('data-lightbox-src');
    img.alt = trigger.getAttribute('aria-label') || '';
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    img.src = '';
    if (lastTrigger) lastTrigger.focus();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      open(trigger);
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
})();
