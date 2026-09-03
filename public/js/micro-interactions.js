(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Hero word-stagger: split each i18n span's text into word-spans with
  // incremental animation-delay, run once on load.
  (function heroStagger() {
    var heading = document.querySelector('.hero h1');
    if (!heading) return;
    var spans = heading.querySelectorAll('[data-i18n-en], [data-i18n-ne]');
    spans.forEach(function (span) {
      var words = span.textContent.split(/(\s+)/);
      span.textContent = '';
      var wordIndex = 0;
      words.forEach(function (chunk) {
        if (chunk.trim() === '') {
          span.appendChild(document.createTextNode(chunk));
          return;
        }
        var word = document.createElement('span');
        word.className = 'stagger-word';
        word.textContent = chunk;
        if (!reduceMotion) {
          word.style.animationDelay = wordIndex * 60 + 'ms';
        }
        span.appendChild(word);
        wordIndex++;
      });
    });
  })();

  if (reduceMotion || !fineHover) return;

  // Hover tilt on the About "What We Stand For" cards.
  document.querySelectorAll('.card').forEach(function (card) {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(600px) rotateX(' + (y * -6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // Magnetic pull on the primary CTA button.
  var magnetRadius = 70;
  document.querySelectorAll('.btn-primary').forEach(function (btn) {
    btn.classList.add('magnetic');
    document.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < magnetRadius) {
        var pull = (1 - dist / magnetRadius) * 0.35;
        btn.style.transform = 'translate(' + dx * pull + 'px, ' + dy * pull + 'px)';
      } else {
        btn.style.transform = '';
      }
    });
  });
})();
