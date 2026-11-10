/* Cloudberry landingspagina — interactie */
(function () {
  'use strict';

  /* ---------- Header: schaduw + leesvoortgang ---------- */
  var header = document.getElementById('header');
  var bar = document.getElementById('progress-bar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Actieve menu-link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Scroll-reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Lightbox ---------- */
  var items = [
    { type: 'img', src: 'assets/img/hero-alle-smaken.jpg', title: 'Vier smaken', text: 'Fris, zacht, warm en fruitig. Voor groot en klein.' },
    { type: 'img', src: 'assets/img/smaak-green-tea.jpg', title: 'Green Tea & Lemongrass', text: 'Fris: groene thee met citroengras.' },
    { type: 'img', src: 'assets/img/smaak-chamomile.jpg', title: 'Chamomile & Honey', text: 'Zacht: kamille met een vleugje honing.' },
    { type: 'img', src: 'assets/img/smaak-ginger.jpg', title: 'Ginger & Turmeric', text: 'Warm: gember en kurkuma.' },
    { type: 'img', src: 'assets/img/smaak-rooibos.jpg', title: 'Rooibos & Forest Berries', text: 'Fruitig: rooibos met bosbessen en framboos.' },
    { type: 'img', src: 'assets/img/verhaal-donker.jpg', title: 'Een wolk en een bes', text: 'Luchtig, fruitig en samen aan tafel.' },
    { type: 'video', src: 'assets/video/cloudberry-video.mp4', poster: 'assets/video/poster.jpg', title: 'Uit de wolken', text: 'Recht op je tafel. Met geluid.' },
    { type: 'img', src: 'assets/img/gezin-ontbijt.jpg', title: 'Ontbijt', text: 'Samen de dag beginnen.' },
    { type: 'img', src: 'assets/img/gezin-picknick.jpg', title: 'Picknick', text: 'Een dekentje, een drinkfles, de hele familie.' },
    { type: 'img', src: 'assets/img/gezin-lachen.jpg', title: 'Na school', text: 'Even bijkletsen met een warm kopje.' }
  ];
  // alt-teksten hergebruiken van de beelden op de pagina
  document.querySelectorAll('[data-lb]').forEach(function (btn) {
    var i = +btn.getAttribute('data-lb'); var img = btn.querySelector('img');
    if (items[i] && img) items[i].alt = img.alt;
    btn.addEventListener('click', function () { open(i, btn); });
  });

  var lb = document.getElementById('lightbox');
  var stage = document.getElementById('lb-stage');
  var tTitle = document.getElementById('lb-title');
  var tText = document.getElementById('lb-text');
  var tCount = document.getElementById('lb-count');
  var current = 0, opener = null;

  function render() {
    var it = items[current];
    stage.innerHTML = '';
    stage.classList.toggle('is-video', it.type === 'video');
    var el;
    if (it.type === 'video') {
      el = document.createElement('video');
      el.src = it.src; el.poster = it.poster; el.controls = true; el.autoplay = true; el.playsInline = true;
      el.setAttribute('aria-label', 'Video: de vier theedozen vallen uit de wolken en landen op tafel.');
    } else {
      el = document.createElement('img');
      el.src = it.src; el.alt = it.alt || it.title;
    }
    stage.appendChild(el);
    tTitle.textContent = it.title;
    tText.textContent = it.text;
    tCount.textContent = (current + 1) + ' / ' + items.length;
  }
  function open(i, from) {
    current = i; opener = from || null;
    render();
    lb.hidden = false;
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    var v = stage.querySelector('video'); if (v) v.pause();
    lb.hidden = true;
    stage.innerHTML = '';
    document.body.classList.remove('lb-open');
    if (opener) opener.focus();
  }
  function step(d) { current = (current + d + items.length) % items.length; render(); }

  lb.querySelectorAll('[data-lb-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') { // focus binnen de lightbox houden
      var f = lb.querySelectorAll('button, video[controls]');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // vegen op gsm
  var sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null;
  });

  /* ---------- Reserveformulier als MailerLite niet laadt ---------- */
  setTimeout(function () {
    var ml = document.querySelector('.ml-embedded');
    if (ml && ml.children.length === 0) {
      ml.hidden = true;
      document.getElementById('fallback-form').hidden = false;
    }
  }, 4000);
  document.getElementById('fallback-form').addEventListener('submit', function (e) {
    e.preventDefault();
    this.querySelector('.fallback-done').hidden = false;
    this.querySelector('button').disabled = true;
  });
})();
