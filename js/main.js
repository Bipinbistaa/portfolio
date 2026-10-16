(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var isEmbed = document.documentElement.classList.contains('embed');
  $('yr').textContent = new Date().getFullYear();

  /* boot screen */
  var boot = $('boot');
  setTimeout(function () { boot.classList.add('done'); document.dispatchEvent(new Event('bootdone')); }, reduce ? 0 : 1250);
  boot.addEventListener('click', function () { boot.classList.add('done'); });   /* never block the page: click to skip */

  /* mobile menu */
  var mb = $('menuBtn'), links = $('links');
  mb.addEventListener('click', function () { var o = links.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  function closeMenu() { links.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); mb.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (links.classList.contains('open') && !links.contains(e.target) && !mb.contains(e.target)) closeMenu(); });

  /* hero name letters */
  var delay = 1.2;
  ['n1', 'n2'].forEach(function (id) {
    var el = $(id), txt = el.textContent; el.textContent = '';
    txt.split('').forEach(function (c) {
      var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
      s.style.animationDelay = (delay += 0.07) + 's'; el.appendChild(s);
    });
  });

  /* safety net: if the letter animation never ran (paused tab, battery saver, odd browser), show the name anyway */
  setTimeout(function () { $('n1').parentNode.classList.add('show-all'); }, reduce ? 0 : 4200);

  /* typed roles */
  var phrases = ['practical systems', 'AI that works', 'secure software', 'robots that move', 'things people use'];
  var tEl = $('typed'), pi = 0, ci = 0, del = false;
  function tick() {
    var p = phrases[pi];
    if (!del) { ci++; if (ci === p.length) { del = true; return setTimeout(tick, 1600); } }
    else { ci--; if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; } }
    tEl.textContent = p.slice(0, ci);
    setTimeout(tick, del ? 38 : 70);
  }
  if (reduce) tEl.textContent = phrases[0]; else setTimeout(tick, 2300);

  /* marquee */
  var words = ['Artificial Intelligence', 'Cybersecurity', 'Robotics', 'Software Engineering', 'Computer Engineering', 'Mentoring', 'Practical systems', 'Leadership'];
  var mq = $('mq');
  for (var k = 0; k < 4; k++) words.forEach(function (w) { var s = document.createElement('span'); s.textContent = w; mq.appendChild(s); });

  /* progress + nav + timeline */
  var nav = $('nav'), prog = $('progress'), tl = $('tl'), fill = $('fill'), toTop = $('toTop');
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  var secs = [].slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = [].slice.call(document.querySelectorAll('nav.links a'));
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 20);
    document.documentElement.classList.toggle('past-hero', window.scrollY > 80);
    toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    fill.style.height = 'calc((100% - 12px) * ' + clamp((vh * 0.6 - r.top) / r.height, 0, 1) + ')';
    var cur = '';
    secs.forEach(function (s) { if (s.getBoundingClientRect().top < vh * 0.4) cur = s.id; });
    navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* text scramble on headings */
  var GL = 'ABCDEF0123456789<>/{}[]=+*#';
  function scramble(el) {
    if (reduce || el.dataset.done) return; el.dataset.done = 1;
    var hl = el.querySelector('.hl'), hlHTML = hl ? hl.outerHTML : '';
    var txt = el.textContent.replace(/\.$/, ''), n = 0, total = txt.length;
    var iv = setInterval(function () {
      n += 0.7;
      var out = '';
      for (var i = 0; i < total; i++) out += (i < n || txt[i] === ' ') ? txt[i] : GL[(Math.random() * GL.length) | 0];
      el.innerHTML = out.replace(/&/g, '&amp;').replace(/</g, '&lt;') + hlHTML;
      if (n >= total) { clearInterval(iv); el.textContent = txt; if (hl) el.insertAdjacentHTML('beforeend', hlHTML); }
    }, 28);
  }

  /* counters */
  function count(el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1300;
    if (reduce) { el.textContent = to + suf; return; }
    (function f(now) { var p = clamp((now - t0) / dur, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); })(t0);
  }

  /* terminal */
  var termLines = [
    ['$ ', 'whoami', 'p'], ['', 'bipin_bista // computer engineer', 'k'],
    ['$ ', 'cat focus.txt', 'p'], ['', '[ "AI", "Cybersecurity", "Robotics", "Software" ]', 's'],
    ['$ ', 'echo $STATUS', 'p'], ['', 'building practical systems_', 'k']
  ];
  var termDone = false;
  function runTerm() {
    if (termDone) return; termDone = true;
    var out = $('termOut'), li = 0;
    if (reduce) { out.innerHTML = termLines.map(function (l) { return '<span class="' + (l[2] === 'p' ? 'p' : l[2]) + '">' + l[0] + '</span>' + l[1].replace(/</g, '&lt;'); }).join('\n'); return; }
    function nextLine() {
      if (li >= termLines.length) return;
      var l = termLines[li++], isCmd = l[2] === 'p', i = 0;
      var sp = document.createElement('span'); sp.className = isCmd ? '' : l[2];
      if (isCmd) { var pr = document.createElement('span'); pr.className = 'p'; pr.textContent = l[0]; out.appendChild(pr); }
      out.appendChild(sp);
      (function typeCh() {
        sp.textContent = l[1].slice(0, ++i);
        if (i < l[1].length) setTimeout(typeCh, isCmd ? 55 : 14);
        else { out.appendChild(document.createTextNode('\n')); setTimeout(nextLine, isCmd ? 260 : 380); }
      })();
    }
    nextLine();
  }

  /* reveal observer */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target; t.classList.add('in'); io.unobserve(t);
      if (t.hasAttribute('data-scramble')) scramble(t);
      if (t.id === 'term' || t.querySelector('#term')) runTerm();
      [].forEach.call(t.querySelectorAll('[data-count]'), count);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.rv, [data-scramble]').forEach(function (el, i) {
    var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
    if (el.classList.contains('tile') || el.classList.contains('fcard')) el.style.transitionDelay = (sib % 4) * 90 + 'ms';
    io.observe(el);
  });
  if (reduce) { document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); }); document.querySelectorAll('[data-count]').forEach(count); runTerm(); }

  /* cursor glow + card tilt + magnetic buttons */
  var glow = $('glow');
  if (fine && !reduce) {
    window.addEventListener('pointermove', function (e) {
      glow.style.opacity = 1; glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    });
    document.querySelectorAll('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transition = 'box-shadow .35s, border-color .35s'; c.style.transform = 'rotateX(' + ((.5 - y) * 8) + 'deg) rotateY(' + ((x - .5) * 10) + 'deg) translateY(-4px)';
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      });
      c.addEventListener('pointerleave', function () { c.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .35s, border-color .35s'; c.style.transform = ''; });
    });
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1), box-shadow .25s, border-color .25s'; b.style.transform = ''; setTimeout(function () { b.style.transition = ''; }, 500); });
    });
  }

  /* neural-net card art */
  (function () {
    var g = $('nn'), NS = 'http://www.w3.org/2000/svg';
    var layers = [[28, [30, 60, 90]], [78, [18, 46, 74, 102]], [128, [34, 86]], [176, [60]]], pts = [];
    layers.forEach(function (L) { pts.push(L[1].map(function (y) { return [L[0], y]; })); });
    var d = 0;
    for (var i = 0; i < pts.length - 1; i++) pts[i].forEach(function (a) { pts[i + 1].forEach(function (b) {
      var l = document.createElementNS(NS, 'line'); l.setAttribute('class', 'edge'); l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); g.appendChild(l);
      if ((d++ % 3) === 0) { var f = l.cloneNode(); f.setAttribute('class', 'flow'); f.style.animationDelay = (-(d % 7) * .3) + 's'; g.appendChild(f); }
    }); });
    var n = 0;
    pts.forEach(function (L) { L.forEach(function (p) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'node'); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 6); c.style.animationDelay = (-(n++ % 6) * .4) + 's'; g.appendChild(c); }); });
  })();

  /* ---------- hero network canvas ---------- */
  var NC = { a: '88,175,255', b: '20,120,216', c: '43,149,245' };
  var cv = $('net'), cx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, nodes = [], mouse = { x: -999, y: -999 }, heroVisible = true;
  function sizeNet() {
    var r = cv.parentElement.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(clamp(W * H / 17000, 24, 80)); nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + 1 });
  }
  function drawNet() {
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      if (!reduce) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 15000) { cx.strokeStyle = 'rgba(' + NC.a + ',' + (0.28 * (1 - d / 15000)) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
      }
      var mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = mdx * mdx + mdy * mdy;
      if (md < 24000) { cx.strokeStyle = 'rgba(' + NC.b + ',' + (0.5 * (1 - md / 24000)) + ')'; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); if (!reduce) { a.x -= mdx * 0.0016; a.y -= mdy * 0.0016; } }
      cx.fillStyle = 'rgba(' + NC.c + ',.55)'; cx.beginPath(); cx.arc(a.x, a.y, a.r, 0, 6.283); cx.fill();
    }
  }
  function netLoop() { if (heroVisible) drawNet(); requestAnimationFrame(netLoop); }
  sizeNet(); drawNet();
  window.addEventListener('resize', function () { sizeNet(); drawNet(); });
  new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe($('hero'));
  $('hero').addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  $('hero').addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  if (!reduce) requestAnimationFrame(netLoop);

  /* ---------- embedded copy on the laptop screen: tell the parent we are ready, and let Esc release the screen ---------- */
  if (isEmbed && window.parent && window.parent !== window) {
    var ready = function () { try { window.parent.postMessage({ type: 'bb-ready' }, '*'); } catch (e) {} };
    if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') { try { window.parent.postMessage({ type: 'bb-exit' }, '*'); } catch (x) {} } });
  }

  /* ---------- theme toggle (light is the default) ---------- */
  var root = document.documentElement, tbtn = $('themeBtn'), meta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (meta) meta.setAttribute('content', t === 'dark' ? '#070a10' : '#ffffff');
    tbtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    tbtn.setAttribute('aria-pressed', t === 'dark');
    if (t === 'dark') { NC.a = '224,181,106'; NC.b = '240,215,164'; NC.c = '224,181,106'; } else { NC.a = '88,175,255'; NC.b = '20,120,216'; NC.c = '43,149,245'; }
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
    document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  /* when embedded inside the laptop screen, follow the parent's theme */
  window.addEventListener('message', function (e) { var d = e.data; if (d && d.type === 'bb-scroll' && typeof d.dy === 'number') { window.scrollBy(0, d.dy); return; } if (d && d.type === 'bb-theme' && (d.theme === 'dark' || d.theme === 'light')) applyTheme(d.theme, false); });
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  tbtn.addEventListener('click', function () { applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true); });
})();
