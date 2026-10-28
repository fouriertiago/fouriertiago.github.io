/* Portfolio Tiago Fourier — page d'accueil : animations et interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var onVisible = function (el, cb, th) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); cb(); } }, { threshold: th || 0.3 });
    io.observe(el);
  };

  /* ---------- réseau animé du hero ---------- */
  (function () {
    var cv = $('#net'); if (!cv || reduce) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [], mouse = { x: -999, y: -999 }, running = true, col = '37,99,235';
    var readCol = function () {
      col = document.documentElement.getAttribute('data-theme') === 'dark' ? '110,155,242' : '37,99,235';
    };
    var size = function () {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, Math.max(26, W * H / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + 1, hub: Math.random() < .12 });
    };
    var frame = function () {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d, max = 130;
      for (i = 0; i < pts.length; i++) {
        p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        dx = p.x - mouse.x; dy = p.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) { p.x += dx / d * .6; p.y += dy / d * .6; }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
          if (d < max * max) {
            ctx.strokeStyle = 'rgba(' + col + ',' + (0.22 * (1 - Math.sqrt(d) / max)).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        ctx.fillStyle = 'rgba(' + col + ',' + (p.hub ? .75 : .45) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.hub ? p.r + 1.6 : p.r, 0, Math.PI * 2); ctx.fill();
        if (p.hub) { ctx.strokeStyle = 'rgba(' + col + ',.18)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2); ctx.stroke(); }
      }
      requestAnimationFrame(frame);
    };
    readCol(); size(); frame();
    window.addEventListener('resize', size);
    window.addEventListener('themechange', readCol);
    var hero = $('.hero');
    hero.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var v = en[0].isIntersecting;
        if (v && !running) { running = true; frame(); } else if (!v) running = false;
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false; else if (!running) { running = true; frame(); }
    });
  })();

  /* ---------- phrase tapée sous le titre ---------- */
  (function () {
    var el = $('#rot'); if (!el) return;
    var list = JSON.parse(el.getAttribute('data-words'));
    if (reduce) { el.textContent = list[0]; return; }
    var w = 0, c = 0, del = false;
    var tick = function () {
      var word = list[w];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      var t = del ? 28 : 55;
      if (!del && c === word.length) { del = true; t = 2200; }
      else if (del && c === 0) { del = false; w = (w + 1) % list.length; t = 350; }
      setTimeout(tick, t);
    };
    tick();
  })();

  /* ---------- terminal ---------- */
  (function () {
    var box = $('#term'); if (!box) return;
    var lines = [
      ['cmd', 'whoami'],
      ['out', 'tiago-fourier — BTS SIO SISR, 2e année'],
      ['cmd', 'cat alternance.txt'],
      ['out', 'Technicien informaticien · LOXYS Solutions Informatiques'],
      ['cmd', 'ls realisations/ | wc -l'],
      ['out', box.getAttribute('data-real')],
      ['cmd', 'systemctl status homelab'],
      ['ok', '● actif — Home Assistant · AdGuard Home · MQTT']
    ];
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var prompt = '<span class="p">tiago@portfolio</span><span class="m">:</span><span class="c">~</span><span class="m">$</span> ';
    var html = '';
    var render = function (extra) { box.innerHTML = html + (extra || '') + '<span class="caret"></span>'; };
    if (reduce) {
      lines.forEach(function (l) { html += (l[0] === 'cmd' ? prompt + esc(l[1]) : '<span class="' + (l[0] === 'ok' ? 'ok' : 'o') + '">' + esc(l[1]) + '</span>') + '<br>'; });
      html += prompt; render(); return;
    }
    var i = 0;
    var next = function () {
      if (i >= lines.length) { html += prompt; render(); return; }
      var l = lines[i++];
      if (l[0] === 'cmd') {
        var k = 0;
        var type = function () {
          k++; render(prompt + esc(l[1].slice(0, k)));
          if (k < l[1].length) setTimeout(type, 40 + Math.random() * 50);
          else { html += prompt + esc(l[1]) + '<br>'; setTimeout(next, 260); }
        };
        render(prompt); setTimeout(type, 380);
      } else {
        html += '<span class="' + (l[0] === 'ok' ? 'ok' : 'o') + '">' + esc(l[1]) + '</span><br>';
        render(); setTimeout(next, 420);
      }
    };
    render(prompt);
    onVisible(box, function () { setTimeout(next, 500); }, 0.2);
  })();

  /* ---------- compteurs ---------- */
  $$('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = to; return; }
    el.textContent = '0';
    onVisible(el, function () {
      var t0 = performance.now(), dur = 1300;
      var step = function (t) {
        var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * k);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.6);
  });
  var meter = $('.meter i');
  if (meter) onVisible(meter, function () { meter.style.width = meter.getAttribute('data-w'); }, 0.5);

  /* ---------- lien actif dans la navigation ---------- */
  (function () {
    var links = $$('.nav-links a[href^="#"]');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var secs = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!secs.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io.observe(s); });
    window.addEventListener('scroll', function () { if (window.scrollY < 300) links.forEach(function (a) { a.classList.remove('active'); }); }, { passive: true });
  })();

  /* ---------- effet lumineux sur les cartes ---------- */
  $$('.skill').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- chaîne du projet phare ---------- */
  (function () {
    var steps = $$('.pipe .step'), pk = $('.pipe .packet');
    if (!steps.length || !pk) return;
    var i = -1, timer = null;
    var go = function () {
      steps.forEach(function (s) { s.classList.remove('lit'); });
      i = (i + 1) % steps.length;
      steps[i].classList.add('lit');
      pk.style.top = (steps[i].offsetTop + 14) + 'px';
    };
    if (reduce) { pk.style.display = 'none'; return; }
    onVisible($('.pipe'), function () { go(); timer = setInterval(go, 1500); }, 0.3);
    steps.forEach(function (s, k) {
      s.addEventListener('mouseenter', function () { clearInterval(timer); i = k - 1; go(); });
      s.addEventListener('mouseleave', function () { clearInterval(timer); timer = setInterval(go, 1500); });
    });
  })();

  /* ---------- schéma du homelab ---------- */
  (function () {
    var nodes = $$('.lab-map .node'), panel = $('#lab-panel');
    if (!nodes.length || !panel) return;
    var auto = null, k = 0, touched = false;
    var select = function (n) {
      nodes.forEach(function (m) { m.classList.remove('on'); m.setAttribute('aria-pressed', 'false'); });
      n.classList.add('on'); n.setAttribute('aria-pressed', 'true');
      panel.querySelector('.k').textContent = n.getAttribute('data-k');
      panel.querySelector('h3').textContent = n.getAttribute('data-t');
      panel.querySelector('p').textContent = n.getAttribute('data-d');
      panel.classList.remove('flash'); void panel.offsetWidth; panel.classList.add('flash');
    };
    var stop = function () { touched = true; clearInterval(auto); };
    nodes.forEach(function (n, idx) {
      n.addEventListener('click', function () { stop(); select(n); k = idx; });
      n.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) { stop(); select(n); } });
      n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stop(); select(n); } });
    });
    var core = $('.lab-map .node.core') || nodes[0];
    select(core); k = nodes.indexOf(core);
    if (!reduce) onVisible($('.lab-map'), function () {
      auto = setInterval(function () { if (touched) return; k = (k + 1) % nodes.length; select(nodes[k]); }, 3800);
    }, 0.4);
  })();

  /* ---------- filtres des réalisations ---------- */
  (function () {
    var grid = $('#rgrid'); if (!grid) return;
    var cards = $$('.rcard', grid), empty = $('#rempty'), status = $('#rstatus'), desc = $('#compdesc');
    var ctx = 'all', code = null;
    var labels = JSON.parse(grid.getAttribute('data-labels'));
    var outside = {
      '6.2': 'Couverte par ma <a href="veille.html">veille informationnelle</a>.',
      '6.3': 'Couverte par ce portfolio, qui gère mon identité professionnelle.',
      '6.4': 'Couverte par mon <a href="#projet-pro">projet professionnel</a>.'
    };
    var apply = function () {
      var n = 0;
      cards.forEach(function (c) {
        var okCtx = ctx === 'all' || c.getAttribute('data-ctx') === ctx;
        var okCode = !code || (' ' + c.getAttribute('data-codes') + ' ').indexOf(' ' + code + ' ') > -1;
        var show = okCtx && okCode;
        c.classList.toggle('hide', !show);
        if (show) n++;
      });
      $$('.rcard .ccode-mini', grid).forEach(function (s) { s.classList.toggle('hit', s.textContent === code); });
      status.innerHTML = '<b>' + n + '</b> réalisation' + (n > 1 ? 's' : '') + ' affichée' + (n > 1 ? 's' : '') +
        ((ctx !== 'all' || code) ? ' <button type="button" id="rreset">Tout afficher</button>' : '');
      if (code) {
        desc.innerHTML = '<b>' + code + '</b> — ' + labels[code] + (outside[code] ? '<br>' + outside[code] : '');
        desc.classList.add('show');
      } else desc.classList.remove('show');
      empty.style.display = n ? 'none' : 'block';
      var rr = $('#rreset'); if (rr) rr.addEventListener('click', reset);
    };
    var reset = function () {
      ctx = 'all'; code = null;
      $$('.fchip').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-ctx') === 'all'); b.setAttribute('aria-pressed', b.getAttribute('data-ctx') === 'all'); });
      $$('.ccode').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
      apply();
    };
    $$('.fchip').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx = b.getAttribute('data-ctx');
        $$('.fchip').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        apply();
      });
    });
    $$('.ccode').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('off')) return;
        var c = b.getAttribute('data-code');
        code = code === c ? null : c;
        $$('.ccode').forEach(function (x) { var on = x.getAttribute('data-code') === code; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        apply();
      });
    });
    apply();
  })();

  /* ---------- fenêtres de détail (parcours) et contact ---------- */
  var lastFocus = null;
  var lock = function (on) { document.body.style.overflow = on ? 'hidden' : ''; };
  window.openModal = function (id) {
    var m = document.getElementById('modal-' + id); if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('open'); lock(true);
    var b = m.querySelector('.modal-close-btn'); if (b) setTimeout(function () { b.focus(); }, 50);
  };
  window.closeModals = function () {
    var was = $$('.modal-bg.open:not(#contact-modal)').length;
    $$('.modal-bg:not(#contact-modal)').forEach(function (m) { m.classList.remove('open'); });
    if (was) { lock(false); if (lastFocus) lastFocus.focus(); }
  };
  window.openContact = function () {
    lastFocus = document.activeElement;
    $('#contact-modal').classList.add('open'); lock(true);
    setTimeout(function () { var i = $('#name'); if (i) i.focus(); }, 80);
  };
  window.closeContact = function () {
    var m = $('#contact-modal'); if (!m.classList.contains('open')) return;
    m.classList.remove('open'); lock(false);
    if (lastFocus) lastFocus.focus();
    setTimeout(function () {
      $('#contact-form').style.display = 'block';
      $('#form-success').style.display = 'none';
      $('#contact-form form').reset();
      var b = $('#submit-btn'); b.disabled = false; b.textContent = 'Envoyer le message';
    }, 300);
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { window.closeModals(); window.closeContact(); } });
  $$('.modal').forEach(function (box) {
    var tabs = $$('.mtab', box);
    tabs.forEach(function (tab) {
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', function () {
        var t = tab.getAttribute('data-tab');
        tabs.forEach(function (x) { x.classList.toggle('active', x === tab); x.setAttribute('aria-selected', x === tab); });
        $$('.mpane', box).forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-pane') === t); });
        var body = $('.modal-body', box); if (body) body.scrollTop = 0;
      });
    });
  });
  window.handleSubmit = async function (e) {
    e.preventDefault();
    var btn = $('#submit-btn'), form = e.target;
    btn.disabled = true; btn.textContent = 'Envoi en cours…';
    try {
      var res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        $('#contact-form').style.display = 'none';
        $('#form-success').style.display = 'block';
      } else { btn.disabled = false; btn.textContent = 'Erreur, réessayer'; }
    } catch (err) { btn.disabled = false; btn.textContent = 'Pas de connexion, réessayer'; }
  };
})();
