/* Klick n Code site behaviour. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme menu ---------- */
  function applyTheme(t) {
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
    else root.removeAttribute('data-theme');
    document.querySelectorAll('[data-theme-value]').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-theme-value') === t));
    });
  }
  var stored = 'auto';
  try { stored = localStorage.getItem('theme') || 'auto'; } catch (e) {}
  applyTheme(stored);

  document.querySelectorAll('.theme').forEach(function (wrap) {
    var toggle = wrap.querySelector('.theme__toggle');
    toggle.addEventListener('click', function () {
      var open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    wrap.querySelectorAll('[data-theme-value]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-theme-value');
        try { localStorage.setItem('theme', t); } catch (e) {}
        applyTheme(t);
        wrap.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      });
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { wrap.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { wrap.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  });

  /* ---------- Mobile menu ---------- */
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('.menu-btn');
  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { menuBtn.click(); menuBtn.focus(); }
    });
  }

  /* ---------- Nav border once page scrolls (sentinel, no scroll listener) ---------- */
  if (nav && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:8px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Reveal: only below-the-fold items wait ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('is-pending'); io.unobserve(en.target); }
      });
    }, { rootMargin: '100000px 0px -8% 0px' }); /* huge top margin: items scrolled past still count */
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('is-pending');
        io.observe(el);
      }
    });
  }

  /* ---------- Spotlight tiles + hero tilt (pointer only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    var art = document.querySelector('[data-tilt]');
    if (art && !reduce) {
      var raf = 0;
      art.parentElement.addEventListener('pointermove', function (e) {
        var r = art.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          art.querySelectorAll('[data-layer]').forEach(function (l) {
            var d = parseFloat(l.getAttribute('data-layer'));
            l.style.transform = 'translate(' + (x * d) + 'px,' + (y * d) + 'px)';
          });
        });
      });
      art.parentElement.addEventListener('pointerleave', function () {
        art.querySelectorAll('[data-layer]').forEach(function (l) { l.style.transform = ''; });
      });
    }
  }

  /* ---------- Count-up stats ---------- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute('data-count'));
        var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
        var t0 = performance.now(), dur = 1400;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 4)));
          el.textContent = pre + v.toLocaleString('en-US') + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { cio.observe(n); });
  }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var txt = b.getAttribute('data-copy');
      var done = function () { var o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
    });
  });

  /* ---------- Contact form: validates, then opens a pre-written email ---------- */
  var form = document.querySelector('#project-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    var plan = params.get('plan');
    if (plan) {
      var pick = form.querySelector('input[name="type"][value="' + plan + '"]');
      if (pick) pick.checked = true;
    }
    var status = form.querySelector('.form__status');
    function check(group) {
      var input = group.querySelector('input:not([type=radio]), textarea');
      if (!input) return true;
      var ok = input.checkValidity();
      group.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    form.querySelectorAll('.field-group').forEach(function (g) {
      var input = g.querySelector('input:not([type=radio]), textarea');
      if (input) input.addEventListener('blur', function () { if (input.value) check(g); });
      if (input) input.addEventListener('input', function () { if (g.classList.contains('has-error')) check(g); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var groups = form.querySelectorAll('.field-group');
      var firstBad = null;
      groups.forEach(function (g) { if (!check(g) && !firstBad) firstBad = g; });
      if (firstBad) {
        status.textContent = 'Please fix the highlighted fields.';
        firstBad.querySelector('input, textarea').focus();
        return;
      }
      var d = new FormData(form);
      var type = d.get('type') || 'Not sure yet';
      var subject = 'Project inquiry: ' + type;
      var body = 'Hi Klick n Code,\n\n' + d.get('message') + '\n\nProject type: ' + type +
        '\nBudget: ' + (d.get('budget') || 'Not set') + '\n\nName: ' + d.get('name') + '\nReply to: ' + d.get('email');
      window.location.href = 'mailto:brigadokeene@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Your email app should open with the message ready. If it did not, email brigadokeene@gmail.com directly.';
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
