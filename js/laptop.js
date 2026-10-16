/* Interactive 3D laptop (pure CSS 3D, no libraries).
   Hero of the page, in both themes. The screen is a live copy of this portfolio.
   - If 3D is unsupported or anything throws, the page falls back to a static screenshot (html.lap-failed).
   - The screen is "locked" by default so the page always scrolls normally; click / tap it (or press Enter) to use it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var stage = document.getElementById('lapStage');
  if (!stage || root.classList.contains('embed')) return;

  var ok = true;
  try { if (window.CSS && CSS.supports) ok = CSS.supports('transform-style', 'preserve-3d') || CSS.supports('-webkit-transform-style', 'preserve-3d'); } catch (e) {}
  if (!ok) { root.classList.add('lap-failed'); return; }
  try { build(); } catch (err) {
    if (window.console) console.error('[laptop] 3D hero failed, showing the static fallback instead.', err);
    root.classList.add('lap-failed');
  }

  function build() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var scene = document.getElementById('lapScene'), lap = document.getElementById('laptop');
    var W = 560, D = 380, H = 16, L = 360, T = 9, OPEN = 108, YC = 176;
    var open = reduce ? OPEN : 0, openGoal = reduce ? OPEN : 0, intro = !reduce, lidTouched = false;
    var faces = [], frame = null, glare = null, previewReady = false, interactive = false;
    var statusEl = document.getElementById('lapStatus'), hintEl = document.getElementById('lapHint');
    function say(m) { if (statusEl) statusEl.textContent = m; }

    function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
    function face(parent, cls, w, h, tf, n, lid, noShade) {
      var f = el('div', 'f ' + cls, parent);
      f.style.width = w + 'px'; f.style.height = h + 'px'; f.style.transform = tf + ' translate(-50%,-50%)';
      if (!noShade) faces.push({ sh: el('b', 'sh', f), n: n, lid: lid });
      return f;
    }

    /* ---- base ---- */
    var base = el('div', 'part', lap);
    var top = face(base, 'f-top', W, D, 'translate3d(0,' + (-H / 2) + 'px,0) rotateX(90deg)', [0, -1, 0], false);
    face(base, 'f-bottom', W, D, 'translate3d(0,' + (H / 2) + 'px,0) rotateX(-90deg)', [0, 1, 0], false);
    face(base, 'f-front', W, H, 'translate3d(0,0,' + (D / 2) + 'px)', [0, 0, 1], false);
    face(base, 'f-back', W, H, 'translate3d(0,0,' + (-D / 2) + 'px) rotateY(180deg)', [0, 0, -1], false);
    face(base, 'f-left', D, H, 'translate3d(' + (-W / 2) + 'px,0,0) rotateY(-90deg)', [-1, 0, 0], false);
    face(base, 'f-right', D, H, 'translate3d(' + (W / 2) + 'px,0,0) rotateY(90deg)', [1, 0, 0], false);

    el('div', 'lap-hinge', top);
    var kbd = el('div', 'kbd', top);
    [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7], [1.6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
     [1.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], [2.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.4], [1.1, 1.1, 1.1, 1.3, 5.2, 1.3, 1.1, 1.1, 1.1]].forEach(function (r, i) {
      var row = el('div', 'row' + (i === 0 ? ' fn' : ''), kbd);
      r.forEach(function (w) { var k = el('i', 'k', row); k.style.flex = w; });
    });
    el('div', 'tpad', top);

    /* ---- lid (hinged at the back edge of the base) ---- */
    var lid = el('div', 'part', lap);
    function applyLid() { lid.style.transform = 'translate3d(0,' + (-H / 2) + 'px,' + (-D / 2) + 'px) rotateX(' + open.toFixed(2) + 'deg)'; }
    applyLid();
    var outer = face(lid, 'f-lid-out', W, L, 'translate3d(0,' + (-T / 2) + 'px,' + (L / 2) + 'px) rotateX(90deg)', [0, -1, 0], true);
    el('span', 'mono', outer).textContent = 'BB';
    var inner = face(lid, 'f-lid-in', W, L, 'translate3d(0,' + (T / 2) + 'px,' + (L / 2) + 'px) rotateX(-90deg)', [0, 1, 0], true, true);
    face(lid, 'f-lid-edge', W, T, 'translate3d(0,0,' + L + 'px)', [0, 0, 1], true);
    face(lid, 'f-lid-edge', W, T, 'rotateY(180deg)', [0, 0, -1], true);
    face(lid, 'f-lid-edge', L, T, 'translate3d(' + (-W / 2) + 'px,0,' + (L / 2) + 'px) rotateY(-90deg)', [-1, 0, 0], true);
    face(lid, 'f-lid-edge', L, T, 'translate3d(' + (W / 2) + 'px,0,' + (L / 2) + 'px) rotateY(90deg)', [1, 0, 0], true);

    var scr = el('div', 'scr', inner);
    function curTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    function paintScreen() { scr.style.backgroundImage = 'url(assets/screen-' + curTheme() + '.jpg)'; }
    paintScreen();
    var scale = el('div', 'scale', scr);
    el('div', 'cam', inner);
    glare = el('div', 'glare', scr);
    var shield = el('div', 'shield', scr);   /* sits over the live preview so it never steals page scroll or drags */
    shield.setAttribute('data-label', coarse ? 'Tap to explore' : 'Click to explore');

    /* ---- live preview iframe: fades in only once the embedded page says it is ready ---- */
    function ensureFrame() {
      if (frame) return;
      frame = el('iframe', '', scale);
      frame.title = 'Live preview of this portfolio on the laptop screen';
      frame.setAttribute('tabindex', '-1'); frame.setAttribute('aria-hidden', 'true'); frame.setAttribute('loading', 'eager');
      frame.src = location.href.split('#')[0].split('?')[0] + '?embed=1&theme=' + curTheme();
      frame.addEventListener('load', pushTheme);
    }
    function pushTheme() { paintScreen(); if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'bb-theme', theme: curTheme() }, '*'); }
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || !frame || e.source !== frame.contentWindow) return;
      if (d.type === 'bb-ready') { previewReady = true; frame.classList.add('ready'); shield.classList.add('live'); pushTheme(); }
      else if (d.type === 'bb-exit' && interactive) { setInteractive(false); try { stage.focus({ preventScroll: true }); } catch (x) {} }
    });

    /* ---- rotation state ---- */
    var ry = 0, tilt = -12, ey = 0, et = -12, lx = 0, ly = 0, tlx = 0, tly = 0, lastY2 = window.scrollY, goal = null, vel = 0, spin = false, dragging = false, hover = false, idleSince = 0, lastX = 0, lastY = 0, downX = 0, downY = 0, moved = 0, active = false;
    var spinBtn = document.getElementById('lapSpin'), lidBtn = document.getElementById('lapLid'), openCta = document.getElementById('lapOpen'), exitBtn = document.getElementById('lapExit');
    var LIGHT = (function () { var v = [-0.45, -0.7, 0.55], m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; })();
    var rad = Math.PI / 180;
    function norm(a) { a = a % 360; if (a > 180) a -= 360; if (a <= -180) a += 360; return a; }
    function poke() { idleSince = performance.now(); }
    function touchedOnce() { stage.classList.add('touched'); }
    if (coarse && hintEl) hintEl.innerHTML = 'swipe to rotate &middot; tap the screen to explore';
    lidBtn.setAttribute('aria-pressed', String(openGoal > 0));

    function worldNormal(n, isLid) {
      var x = n[0], y = n[1], z = n[2], c, s, t;
      if (isLid) { c = Math.cos(open * rad); s = Math.sin(open * rad); t = y * c - z * s; z = y * s + z * c; y = t; }
      c = Math.cos(ey * rad); s = Math.sin(ey * rad); t = x * c + z * s; z = -x * s + z * c; x = t;
      c = Math.cos(et * rad); s = Math.sin(et * rad); t = y * c - z * s; z = y * s + z * c; y = t;
      return [x, y, z];
    }
    function render() {
      ey = ry + lx * 16; et = Math.max(-40, Math.min(-2, tilt + ly * 5));
      applyLid();
      lap.style.transform = 'perspective(1700px) translate3d(0,' + YC + 'px,0) rotateX(' + et.toFixed(2) + 'deg) rotateY(' + ey.toFixed(2) + 'deg)';
      for (var i = 0; i < faces.length; i++) {
        var w = worldNormal(faces[i].n, faces[i].lid), d = w[0] * LIGHT[0] + w[1] * LIGHT[1] + w[2] * LIGHT[2];
        faces[i].sh.style.opacity = Math.max(0, Math.min(0.62, 1 - (0.4 + 0.7 * Math.max(d, 0)))).toFixed(3);
      }
      var sn = worldNormal([0, 1, 0], true);
      if (interactive && (sn[2] < 0.3 || open < 95)) setInteractive(false);   /* screen turned away: release it */
      if (frame) frame.style.pointerEvents = (interactive && previewReady) ? 'auto' : 'none';
      glare.style.setProperty('--gx', (50 + norm(ey) * 1.6).toFixed(1) + '%');
    }

    /* ---- screen "locked / active" mode ---- */
    function setInteractive(on) {
      if (on === interactive) return;
      if (on && !previewReady) return;
      interactive = on;
      stage.classList.toggle('screen-on', on);
      if (on) { goal = ry - norm(ry); tilt = -10; tlx = tly = 0; vel = 0; spin = false; spinBtn.setAttribute('aria-pressed', 'false'); say('Screen active. Scroll or click inside it. Press Escape to exit.'); }
      else say('Screen released.');
      poke();
    }
    exitBtn.addEventListener('click', function () { setInteractive(false); try { stage.focus({ preventScroll: true }); } catch (x) {} });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && interactive) { setInteractive(false); try { stage.focus({ preventScroll: true }); } catch (x) {} } });
    document.addEventListener('pointerdown', function (e) { if (interactive && !stage.contains(e.target)) setInteractive(false); });

    /* ---- lid ---- */
    function lidTo(isOpen, byUser) {
      if (byUser) lidTouched = true;
      openGoal = isOpen ? OPEN : 0; intro = !byUser && isOpen && !reduce;
      stage.classList.toggle('closed', !isOpen);
      lidBtn.setAttribute('aria-pressed', String(isOpen)); lidBtn.title = isOpen ? 'Close the lid (L)' : 'Open the lid (L)';
      if (!isOpen) setInteractive(false);
      if (byUser) say(isOpen ? 'Lid open.' : 'Lid closed.');
      poke();
    }
    function toggleLid() { touchedOnce(); lidTo(openGoal === 0, true); }
    /* play the opening animation after the boot screen has gone, so it is actually seen */
    var introTimer = setTimeout(introOpen, 2400);
    function introOpen() { clearTimeout(introTimer); if (lidTouched || openGoal > 0) return; lidTo(true, false); }
    document.addEventListener('bootdone', introOpen);

    /* ---- animation loop (runs only while visible) ---- */
    var raf = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      try {
        open += (openGoal - open) * (intro ? 0.045 : 0.09); if (Math.abs(openGoal - open) < 0.05) { open = openGoal; intro = false; }
        lx += (tlx - lx) * 0.07; ly += (tly - ly) * 0.07;
        if (!dragging) {
          if (goal !== null) { var diff = goal - ry; ry += diff * 0.12; if (Math.abs(diff) < 0.05) { ry = goal; goal = null; } }
          else if (Math.abs(vel) > 0.02) { ry += vel; vel *= 0.94; }
          else if (spin) { ry += 0.45; }
          else if (!hover && !interactive && now - idleSince > 3500) {
            var n = norm(ry);
            if (Math.abs(n) < 45) { ry = n + (Math.sin(now / 2600) * 14 - n) * 0.02; }
            else if (now - idleSince > 4500) { goal = ry - n; }   /* drift back to the front */
          }
        }
        render();
      } catch (err) { stop(); root.classList.add('lap-failed'); if (window.console) console.error('[laptop] render error', err); }
    }
    function start() { if (!raf && active) { idleSince = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function sync() { ensureFrame(); if (active) start(); else { stop(); setInteractive(false); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { active = e[0].isIntersecting; sync(); }, { rootMargin: '120px' }).observe(stage);
    else { active = true; }
    document.addEventListener('themechange', function () { pushTheme(); sync(); });
    sync();

    /* ---- fit the fixed-size scene into its container ---- */
    function fit() { scene.style.setProperty('--s', Math.min(0.98, stage.clientWidth / 660 * 0.98).toFixed(4)); }
    fit(); window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);

    /* ---- project the screen quad to client coords (so a tap on the screen is recognised even if the browser's 3D hit-test misses) ---- */
    function project(x, y, z) {
      var c = Math.cos(open * rad), s = Math.sin(open * rad), y1 = y * c - z * s, z1 = y * s + z * c;
      y1 -= H / 2; z1 -= D / 2;
      c = Math.cos(ey * rad); s = Math.sin(ey * rad); var x2 = x * c + z1 * s, z2 = -x * s + z1 * c;
      c = Math.cos(et * rad); s = Math.sin(et * rad); var y3 = y1 * c - z2 * s, z3 = y1 * s + z2 * c; y3 += YC;
      var f = 1700 / (1700 - z3), r = scene.getBoundingClientRect(), k = r.width / 660;
      return [r.left + (330 + x2 * f) * k, r.top + (300 + y3 * f) * k];
    }
    function overScreen(px, py) {
      var q = [project(-268, T / 2, L - 12), project(268, T / 2, L - 12), project(268, T / 2, 13), project(-268, T / 2, 13)], inside = false;
      for (var i = 0, j = 3; i < 4; j = i++) {
        if (((q[i][1] > py) !== (q[j][1] > py)) && (px < (q[j][0] - q[i][0]) * (py - q[i][1]) / (q[j][1] - q[i][1]) + q[i][0])) inside = !inside;
      }
      return inside;
    }
    function screenFacing() { return worldNormal([0, 1, 0], true)[2] > 0.35 && open > 95; }

    /* ---- drag to rotate; a tap (no movement) opens a closed lid or activates the screen ---- */
    function isCtl(t) { return t.closest('.lap-ctl') || t.closest('.lap-open') || t.closest('.lap-exit') || t.closest('iframe'); }
    stage.addEventListener('pointerdown', function (e) {
      if (isCtl(e.target)) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (interactive) setInteractive(false);
      touchedOnce();
      dragging = true; goal = null; vel = 0; moved = 0; downX = lastX = e.clientX; downY = lastY = e.clientY; stage.classList.add('drag');
      try { stage.setPointerCapture(e.pointerId); } catch (x) {}
      poke();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      ry += dx * 0.55; vel = dx * 0.55; tilt = Math.max(-34, Math.min(-4, tilt + dy * 0.12)); poke();
    });
    function endDrag() { if (!dragging) return false; dragging = false; stage.classList.remove('drag'); poke(); return true; }
    stage.addEventListener('pointerup', function (e) {
      if (!endDrag() || moved >= 6) return;
      vel = 0;
      if (openGoal === 0) { toggleLid(); return; }
      if (screenFacing() && overScreen(e.clientX, e.clientY)) setInteractive(true);
    });
    stage.addEventListener('pointercancel', endDrag);

    /* cursor leans the laptop; page scroll gently spins it */
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (interactive) { tlx = tly = 0; return; }
      tlx = Math.max(-1, Math.min(1, (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)));
      tly = Math.max(-1, Math.min(1, (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)));
    });
    document.documentElement.addEventListener('mouseleave', function () { tlx = tly = 0; });
    window.addEventListener('scroll', function () {
      var y = window.scrollY, d = y - lastY2; lastY2 = y;
      if (active && !dragging && !interactive) { goal = null; ry -= Math.max(-4, Math.min(4, d * 0.12)); poke(); }
    }, { passive: true });
    stage.addEventListener('pointerenter', function () { hover = true; });
    stage.addEventListener('pointerleave', function () { hover = false; poke(); });

    /* ---- buttons + keyboard ---- */
    function turn(d) { setInteractive(false); touchedOnce(); spin = false; spinBtn.setAttribute('aria-pressed', 'false'); vel = 0; goal = Math.round((goal !== null ? goal : ry) / 90) * 90 + d; poke(); }
    function front() { touchedOnce(); spin = false; spinBtn.setAttribute('aria-pressed', 'false'); vel = 0; goal = ry - norm(ry); tilt = -12; say('Facing front.'); poke(); }
    function toggleSpin() { setInteractive(false); touchedOnce(); spin = !spin; goal = null; spinBtn.setAttribute('aria-pressed', String(spin)); say(spin ? 'Spinning.' : 'Spin stopped.'); poke(); }
    document.getElementById('lapL').addEventListener('click', function () { turn(-90); });
    document.getElementById('lapR').addEventListener('click', function () { turn(90); });
    document.getElementById('lapFront').addEventListener('click', front);
    spinBtn.addEventListener('click', toggleSpin);
    lidBtn.addEventListener('click', toggleLid);
    openCta.addEventListener('click', toggleLid);
    stage.addEventListener('keydown', function (e) {
      if (e.target !== stage || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === 'ArrowLeft') { turn(-90); e.preventDefault(); }
      else if (k === 'ArrowRight') { turn(90); e.preventDefault(); }
      else if (k === 'ArrowUp') { touchedOnce(); tilt = Math.max(-34, tilt - 6); poke(); e.preventDefault(); }
      else if (k === 'ArrowDown') { touchedOnce(); tilt = Math.min(-4, tilt + 6); poke(); e.preventDefault(); }
      else if (k === 'l' || k === 'L') toggleLid();
      else if (k === 'f' || k === 'F' || k === 'Home') { front(); e.preventDefault(); }
      else if (k === 's' || k === 'S') toggleSpin();
      else if (k === 'Enter') { if (openGoal === 0) toggleLid(); else if (previewReady) { setInteractive(true); try { frame.focus(); } catch (x) {} } e.preventDefault(); }
      else if (k === 'Escape') { spin = false; spinBtn.setAttribute('aria-pressed', 'false'); }
    });

    render();
    root.classList.add('lap-ready');
    /* test hook */
    window.__lap = { set: function (a, t) { ry = a; if (t != null) tilt = t; render(); }, state: function () { return { ry: ry, tilt: tilt, open: open, openGoal: openGoal, interactive: interactive, previewReady: previewReady }; } };
  }
})();
