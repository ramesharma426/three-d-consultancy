(function () {
  var ticks = document.querySelectorAll('.sidebar-tick');
  if (!ticks.length || !('IntersectionObserver' in window)) return;

  var linkFor = {};
  ticks.forEach(function (tick) {
    var id = tick.getAttribute('href').slice(1);
    linkFor[id] = tick;
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          ticks.forEach(function (t) { t.classList.remove('is-on'); });
          link.classList.add('is-on');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );

  Object.keys(linkFor).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();
