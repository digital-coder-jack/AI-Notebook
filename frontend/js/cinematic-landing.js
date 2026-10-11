/* AI Notebook — Cinematic Landing Page
   Vanilla JS: canvas-based animated background (video fallback),
   mobile menu toggle, smooth scroll, auth-aware CTA redirects.
   No external dependencies. Respects prefers-reduced-motion. */
(function () {
  'use strict';

  /* ---- Auth-aware redirect ----
     If the user is already logged in (SS.isAuthed() returns true),
     redirect them to /dashboard so they don't see the landing page. */
  function authRedirect() {
    try {
      if (typeof SS !== 'undefined' && SS.isAuthed && SS.isAuthed()) {
        window.location.href = '/dashboard';
      }
    } catch (e) { /* SS not loaded yet — stay on landing page */ }
  }

  /* ---- Mobile menu toggle ---- */
  function initMobileMenu() {
    var button = document.querySelector('.cl-menu-button');
    var nav = document.querySelector('.cl-nav');
    if (!button || !nav) return;

    function closeMenu(restoreFocus) {
      nav.classList.remove('menu-open');
      button.setAttribute('aria-expanded', 'false');
      if (restoreFocus) button.focus();
    }

    button.addEventListener('click', function () {
      var shouldOpen = !nav.classList.contains('menu-open');
      if (shouldOpen) {
        nav.classList.add('menu-open');
        button.setAttribute('aria-expanded', 'true');
      } else {
        closeMenu(false);
      }
    });

    // Close menu when a link is clicked
    var links = nav.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !button.contains(e.target)) {
        closeMenu(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) closeMenu(true);
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (href === '#main-content') {
          target.focus({ preventScroll: true });
          window.history.replaceState(null, '', href);
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---- Canvas animated background ----
     Renders flowing gradient particles and light trails to simulate
     a cinematic video background. Falls back to a static CSS gradient
     if canvas is unsupported or reduced-motion is preferred. */
  function initCanvasBackground() {
    var canvas = document.getElementById('cl-canvas');
    if (!canvas) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { canvas.style.display = 'none'; return; }

    var ctx = canvas.getContext('2d');
    if (!ctx) { canvas.style.display = 'none'; return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0;
    var particles = [];
    var PARTICLE_COUNT = 80;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function Particle() {
      this.reset();
      this.y = Math.random() * height;
    }

    Particle.prototype.reset = function () {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(0.3 + Math.random() * 0.8);
      this.radius = 1 + Math.random() * 2.5;
      this.opacity = 0.15 + Math.random() * 0.35;
      var colors = [
        [244, 108, 170],  // pink
        [84, 126, 252],   // blue
        [139, 79, 226],   // purple
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    };

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    };

    Particle.prototype.draw = function () {
      var c = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + this.opacity + ')';
      ctx.fill();
    };

    function init() {
      resize();
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function animate(time) {
      // Clear with subtle trail effect
      ctx.clearRect(0, 0, width, height);

      // Animated radial gradient orbs
      var t = time * 0.0002;
      var orb1x = width * 0.72 + Math.sin(t) * 80;
      var orb1y = height * 0.3 + Math.cos(t * 1.3) * 60;
      var orb2x = width * 0.25 + Math.cos(t * 0.8) * 70;
      var orb2y = height * 0.6 + Math.sin(t * 1.1) * 50;

      var grad1 = ctx.createRadialGradient(orb1x, orb1y, 0, orb1x, orb1y, 350);
      grad1.addColorStop(0, 'rgba(92,75,232,0.08)');
      grad1.addColorStop(0.5, 'rgba(238,75,166,0.04)');
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      var grad2 = ctx.createRadialGradient(orb2x, orb2y, 0, orb2x, orb2y, 280);
      grad2.addColorStop(0, 'rgba(69,105,244,0.06)');
      grad2.addColorStop(0.5, 'rgba(84,126,252,0.03)');
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      if (animId !== null) animId = requestAnimationFrame(animate);
    }

    // Visibility-based pause for performance
    var animId = null;
    function startAnim() {
      if (animId === null) animId = requestAnimationFrame(animate);
    }
    function stopAnim() {
      if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAnim(); else startAnim();
    });

    // Pause on small screens for battery (still shows the CSS fallback gradient)
    var isSmall = window.matchMedia('(max-width: 620px)').matches;
    if (isSmall) {
      // Reduce particle count on mobile
      PARTICLE_COUNT = 30;
    }

    init();
    startAnim();

    // Debounced resize
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { init(); }, 200);
    });
  }

  /* ---- Init on DOM ready ---- */
  function init() {
    authRedirect();
    initMobileMenu();
    initSmoothScroll();
    initCanvasBackground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
