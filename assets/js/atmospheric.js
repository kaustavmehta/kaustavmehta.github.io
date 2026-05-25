(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var reveals = document.querySelectorAll('.atmo-reveal');
  if (reveals.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach(function (el) { observer.observe(el); });
  }

  var about = document.querySelector('.about');
  if (about) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var maxScroll = document.body.scrollHeight - window.innerHeight;
          var progress = maxScroll > 0 ? scrollY / maxScroll : 0;
          var shift = (progress - 0.5) * 30;
          about.style.setProperty('--atmo-parallax-y', shift + 'px');
          ticking = false;
        });
        ticking = true;
      }
    });
  }
})();
