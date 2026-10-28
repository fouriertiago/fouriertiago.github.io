/* Portfolio Tiago Fourier — script commun à toutes les pages
   thème clair/sombre, barre de lecture, retour en haut, apparitions, visionneuse de preuves */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- thème ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0A1120' : '#F6F8FC');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', t === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
    });
    window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  applyTheme(currentTheme());
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    var t = currentTheme() === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');
    applyTheme(t); store('theme', t);
    setTimeout(function () { root.classList.remove('theme-anim'); }, 400);
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function (ev) { if (!store('theme')) applyTheme(ev.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
  }

  /* ---------- menu mobile ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-burger]');
    var links = document.querySelector('.nav-links');
    if (b && links) {
      var open = links.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    if (links && links.classList.contains('open') && e.target.closest('.nav-links a')) {
      links.classList.remove('open');
      var bb = document.querySelector('[data-burger]'); if (bb) bb.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- défilement : barre de lecture, nav, retour en haut ---------- */
  var bar = document.querySelector('.progress');
  var nav = document.querySelector('nav.top, .pnav');
  var top = document.querySelector('.totop');
  var ticking = false;
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY || window.pageYOffset;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (top) top.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- apparitions au défilement ---------- */
  document.querySelectorAll('.pbody > .block, .pbody > .pager').forEach(function (el) { el.classList.add('reveal'); });
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- visionneuse des preuves (images) ---------- */
  var imgLinks = Array.prototype.slice.call(document.querySelectorAll('figure a[href]')).filter(function (a) {
    return /\.(png|jpe?g|webp|gif)$/i.test(a.getAttribute('href'));
  });
  if (imgLinks.length) {
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Visionneuse de preuves');
    var ico = function (d) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; };
    lb.innerHTML = '<span class="lb-count"></span>' +
      '<button class="lb-btn lb-close" type="button" aria-label="Fermer">' + ico('<path d="M18 6 6 18M6 6l12 12"/>') + '</button>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Preuve précédente">' + ico('<path d="m15 18-6-6 6-6"/>') + '</button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Preuve suivante">' + ico('<path d="m9 18 6-6-6-6"/>') + '</button>' +
      '<img alt=""><div class="lb-cap"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), cnt = lb.querySelector('.lb-count');
    var idx = 0, lastFocus = null;
    var show = function (i) {
      idx = (i + imgLinks.length) % imgLinks.length;
      var a = imgLinks[idx];
      var fig = a.closest('figure');
      var c = fig && fig.querySelector('figcaption');
      img.src = a.getAttribute('href');
      img.alt = (a.querySelector('img') || {}).alt || '';
      cap.textContent = c ? c.textContent : '';
      cnt.textContent = (idx + 1) + ' / ' + imgLinks.length;
    };
    var open = function (i) { lastFocus = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    imgLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
        e.preventDefault(); open(i);
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
    if (imgLinks.length < 2) { lb.querySelector('.lb-prev').style.display = 'none'; lb.querySelector('.lb-next').style.display = 'none'; }
  }
})();
