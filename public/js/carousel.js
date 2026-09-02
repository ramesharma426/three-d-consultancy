(function () {
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.carousel-card'));
    var prevBtn = root.querySelector('.carousel-nav--prev');
    var nextBtn = root.querySelector('.carousel-nav--next');
    if (!track || cards.length === 0) return;

    var index = 0;
    var timer = null;

    function update() {
      cards.forEach(function (card, i) {
        card.classList.toggle('is-active', i === index);
      });
      var active = cards[index];
      var viewport = root.clientWidth;
      var offset = active.offsetLeft - (viewport - active.offsetWidth) / 2;
      track.style.transform = 'translateX(' + -offset + 'px)';
    }

    function go(delta) {
      index = (index + delta + cards.length) % cards.length;
      update();
    }

    function start() {
      stop();
      timer = setInterval(function () {
        go(1);
      }, 4000);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        go(1);
        start();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        go(-1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    window.addEventListener('resize', update);

    var touchStartX = null;
    var touchStartY = null;
    var touchDeltaX = 0;
    var SWIPE_THRESHOLD = 40;

    track.addEventListener(
      'touchstart',
      function (e) {
        var t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchDeltaX = 0;
        stop();
      },
      { passive: true },
    );

    track.addEventListener(
      'touchmove',
      function (e) {
        if (touchStartX === null) return;
        var t = e.touches[0];
        touchDeltaX = t.clientX - touchStartX;
      },
      { passive: true },
    );

    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var t = e.changedTouches[0];
      var deltaY = t.clientY - touchStartY;
      if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD && Math.abs(touchDeltaX) > Math.abs(deltaY)) {
        go(touchDeltaX < 0 ? 1 : -1);
      }
      touchStartX = null;
      touchStartY = null;
      touchDeltaX = 0;
      start();
    });

    update();
    start();
  });
})();
