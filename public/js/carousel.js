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

    update();
    start();
  });
})();
