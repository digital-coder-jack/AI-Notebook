/* =====================================================================
   Study Sphere AI  -  app.js  (shared helpers, loaded on every page)
   - API client with JWT
   - auth/session helpers
   - toasts, ripple effects, particles config, mobile nav
   ===================================================================== */

const SS = (() => {
  const TOKEN_KEY = 'ss_token';
  const USER_KEY = 'ss_user';

  /* ---------- session ---------- */
  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}'); }
    catch { return {}; }
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function isAuthed() { return !!getToken(); }
  function logout() { clearSession(); window.location.href = '/login'; }
  function requireAuth() {
    if (!isAuthed()) { window.location.href = '/login'; return false; }
    return true;
  }

  /* ---------- API ---------- */
  async function api(path, { method = 'GET', body, auth = true, raw = false } = {}) {
    const headers = {};
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (auth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();

    const res = await fetch(path, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    if (res.status === 401 && auth) {
      clearSession();
      if (!location.pathname.includes('login')) window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    if (raw) return res;

    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    return data;
  }

  /* ---------- toast ---------- */
  function toast(message, type = 'success', ms = 3800) {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'error' ? 'circle-exclamation' : 'circle-check'}"></i> ${message}`;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      setTimeout(() => el.remove(), 320);
    }, ms);
  }

  /* ---------- ripple ---------- */
  function attachRipples(root = document) {
    root.querySelectorAll('.btn').forEach((btn) => {
      if (btn.dataset.ripple) return;
      btn.dataset.ripple = '1';
      btn.addEventListener('click', (e) => {
        const circle = document.createElement('span');
        const d = Math.max(btn.clientWidth, btn.clientHeight);
        const rect = btn.getBoundingClientRect();
        circle.style.width = circle.style.height = d + 'px';
        circle.style.left = e.clientX - rect.left - d / 2 + 'px';
        circle.style.top = e.clientY - rect.top - d / 2 + 'px';
        circle.className = 'ripple';
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      });
    });
  }

  /* ---------- particles ---------- */
  function initParticles(id = 'particles-js') {
    if (!document.getElementById(id) || typeof particlesJS === 'undefined') return;
    particlesJS(id, {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 900 } },
        color: { value: ['#6d7bff', '#a855f7', '#22d3ee'] },
        shape: { type: 'circle' },
        opacity: { value: 0.45, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#6d7bff', opacity: 0.25, width: 1 },
        move: { enable: true, speed: 1.6, out_mode: 'out' },
      },
      interactivity: {
        detect_on: 'window',
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } }, push: { particles_nb: 3 } },
      },
      retina_detect: true,
    });
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  /* ---------- boot common UI ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    attachRipples();
    initNav();
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  });

  return { api, getToken, setSession, getUser, clearSession, isAuthed, logout,
           requireAuth, toast, attachRipples, initParticles };
})();
