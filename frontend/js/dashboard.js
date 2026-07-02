/* =====================================================================
   AI Notebook  -  dashboard.js  (2026 Premium Redesign)
   Populates the redesigned dashboard from the existing /api/stats data.
   No backend changes — all new widgets are derived client-side.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const user = SS.getUser();
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = (user.name || 'there').split(' ')[0];

  // Time-aware, personalized subtitle (uses onboarding answers when present)
  const subEl = document.getElementById('dashSubtitle');
  if (subEl) {
    const h = new Date().getHours();
    const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    let ob = null;
    try { ob = JSON.parse(localStorage.getItem('ainb_onboarding') || 'null'); } catch (e) {}
    if (ob && ob.goal) {
      subEl.textContent = `Good ${part} — let's make progress on “${ob.goal}” today.`;
    } else {
      subEl.textContent = `Good ${part} — here's your learning activity at a glance.`;
    }
  }

  // Guest banner
  if (user.is_guest) showGuestBanner();

  initTopicLauncher();
  renderWorkspaceCards();
  renderTrending();

  try {
    const s = await SS.api('/api/stats');
    renderStats(s);
    renderRecent(s.recent_chats || []);
    renderRecentNotes(s.recent_notes || []);
    renderChart(s.daily_activity || []);
    renderProgress(s);
    renderAiUsage(s);
    renderAchievements(s);
  } catch (err) {
    SS.toast(err.message, 'error');
  }

  loadMyTopics();
  loadProvidersMini();
});

/* =====================================================================
   LEARNING OS — topic launcher, workspace cards, trending, my topics
   ===================================================================== */
function openTopic(title, tab) {
  const url = '/topic?t=' + encodeURIComponent(title) + (tab ? '#' + tab : '');
  window.location.href = url;
}

function initTopicLauncher() {
  const form = document.getElementById('topicForm');
  const input = document.getElementById('topicInput');
  if (!form || !input) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) { SS.toast('Type a topic to start learning', 'error'); return; }
    const btn = document.getElementById('topicGo');
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Building…';
    openTopic(t);
  });
}

function renderWorkspaceCards() {
  const grid = document.getElementById('workspaceGrid');
  if (!grid) return;
  const tools = [
    { tab: 'notes',      h: 190, ic: 'fa-note-sticky',        t: 'AI Notes',      d: 'Professional study notes with definitions, examples & revision summary.' },
    { tab: 'summary',    h: 215, ic: 'fa-align-left',          t: 'AI Summary',    d: 'Deep structured summary — history, how it works, pros & cons, FAQ.' },
    { tab: 'mindmap',    h: 260, ic: 'fa-diagram-project',     t: 'AI Mind Map',   d: 'Interactive mind map. Zoom, pan and expand nodes to explore.' },
    { tab: 'roadmap',    h: 150, ic: 'fa-route',               t: 'AI Roadmap',    d: 'Beginner → Expert path with projects and progress tracking.' },
    { tab: 'quiz',       h: 25,  ic: 'fa-clipboard-question',  t: 'AI Quiz',       d: 'MCQ, true/false & fill-in-the-blanks at 4 difficulty levels.' },
    { tab: 'flashcards', h: 45,  ic: 'fa-layer-group',         t: 'AI Flashcards', d: 'Flip-card deck with bookmarks, built for fast revision.' },
    { tab: 'chat',       h: 290, ic: 'fa-comments',            t: 'AI Chat',       d: 'A dedicated tutor that understands your current topic.' },
    { tab: 'practice',   h: 350, ic: 'fa-dumbbell',            t: 'AI Practice',   d: 'Exercises, assignments, mini projects & coding challenges.' },
    { tab: 'compare',    h: 175, ic: 'fa-scale-balanced',      t: 'AI Compare',    d: 'Side-by-side comparison with any other topic.' },
    { tab: 'timeline',   h: 10,  ic: 'fa-timeline',            t: 'AI Timeline',   d: 'The chronological story: key events and evolution.' },
  ];
  grid.innerHTML = tools.map((c) => `
    <button class="ws-card" data-tab="${c.tab}" style="--ws-h:${c.h}">
      <span class="ws-ic"><i class="fas ${c.ic}"></i></span>
      <b>${c.t}</b><p>${c.d}</p>
      <span class="ws-launch">Quick launch <i class="fas fa-arrow-right"></i></span>
    </button>`).join('');
  grid.classList.add('in-view');
  grid.querySelectorAll('.ws-card').forEach((card) => {
    card.addEventListener('click', () => {
      const input = document.getElementById('topicInput');
      const t = (input && input.value.trim()) || '';
      if (t) { openTopic(t, card.dataset.tab); return; }
      // No topic typed — focus the launcher with a hint.
      if (input) {
        input.focus();
        input.placeholder = 'Type a topic first, then launch ' + card.querySelector('b').textContent + '…';
        document.getElementById('learn-launcher').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      SS.toast('Enter a topic above to launch this tool', 'error');
    });
  });
  if (window.SSMotion) SSMotion.refresh();
}

function renderTrending() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;
  const topics = [
    { t: 'Artificial Intelligence', e: '🤖', g: ['#6366f1', '#8b5cf6'], s: 'Tech' },
    { t: 'Machine Learning',        e: '🧠', g: ['#8b5cf6', '#d946ef'], s: 'Tech' },
    { t: 'Quantum Computing',       e: '⚛️', g: ['#06b6d4', '#3b82f6'], s: 'Science' },
    { t: 'Blockchain',              e: '⛓️', g: ['#f59e0b', '#f97316'], s: 'Tech' },
    { t: 'Cybersecurity',           e: '🔐', g: ['#10b981', '#059669'], s: 'Tech' },
    { t: 'Physics',                 e: '🌌', g: ['#3b82f6', '#6366f1'], s: 'Science' },
    { t: 'Mathematics',             e: '➗', g: ['#ec4899', '#f43f5e'], s: 'Science' },
    { t: 'Biology',                 e: '🧬', g: ['#22c55e', '#84cc16'], s: 'Science' },
    { t: 'History',                 e: '🏛️', g: ['#a16207', '#ca8a04'], s: 'Humanities' },
  ];
  grid.innerHTML = topics.map((x) => `
    <button class="trend-card" data-topic="${escapeHtml(x.t)}"
      style="background:linear-gradient(135deg, ${x.g[0]}, ${x.g[1]})">
      <span class="tr-emoji">${x.e}</span><b>${escapeHtml(x.t)}</b><span>${x.s}</span>
    </button>`).join('');
  grid.classList.add('in-view');
  grid.querySelectorAll('.trend-card').forEach((c) =>
    c.addEventListener('click', () => openTopic(c.dataset.topic)));
  if (window.SSMotion) SSMotion.refresh();
}

async function loadMyTopics() {
  const section = document.getElementById('myTopicsSection');
  const grid = document.getElementById('myTopics');
  if (!section || !grid) return;
  try {
    const res = await SS.api('/api/topics');
    const topics = (res.topics || []).slice(0, 8);
    if (!topics.length) return;
    section.hidden = false;
    grid.innerHTML = topics.map((t) => `
      <a class="topic-card" href="/topic?id=${t.id}">
        <span class="tc-emoji">${escapeHtml(t.emoji || '📚')}</span>
        <span class="tc-meta"><b>${escapeHtml(t.title)}</b>
          <span>${(t.sections || []).length} section${(t.sections || []).length === 1 ? '' : 's'} · ${formatDate(t.updated_at)}</span>
        </span>
        <span class="tc-flags">${t.pinned ? '<i class="fas fa-thumbtack tc-pin"></i>' : ''}${t.favorite ? '<i class="fas fa-star"></i>' : ''}</span>
      </a>`).join('');
    grid.classList.add('in-view');
    if (window.SSMotion) SSMotion.refresh();
  } catch { /* topics are optional on first load */ }
}

/* ---------- Recent notes with pin/favorite/duplicate/share/delete ---------- */
function renderRecentNotes(notes) {
  const box = document.getElementById('recentNotes');
  if (!box) return;
  if (!notes.length) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-note-sticky"></i></div>
        <h4>No notes yet</h4>
        <p>Generate AI notes from any topic workspace.</p>
        <a href="/tools#notes" class="btn small"><i class="fas fa-plus"></i> New note</a>
      </div>`;
    return;
  }
  // pinned first
  notes = notes.slice().sort((a, b) => (b.pinned || 0) - (a.pinned || 0));
  box.innerHTML = notes.map((n) => `
    <div class="note-item" data-id="${n.id}">
      <div class="ni-main" data-open="1"><b>${escapeHtml(n.topic)}</b><small>${formatDate(n.created_at)}</small></div>
      <span class="ni-flags">${n.pinned ? '<i class="fas fa-thumbtack"></i>' : ''}${n.favorite ? '<i class="fas fa-star"></i>' : ''}</span>
      <div class="note-actions">
        <button data-act="pin" title="${n.pinned ? 'Unpin' : 'Pin'}" aria-label="Pin note"><i class="fas fa-thumbtack"></i></button>
        <button data-act="fav" title="${n.favorite ? 'Unfavorite' : 'Favorite'}" aria-label="Favorite note"><i class="${n.favorite ? 'fas' : 'far'} fa-star"></i></button>
        <button data-act="dup" title="Duplicate" aria-label="Duplicate note"><i class="fas fa-copy"></i></button>
        <button data-act="share" title="Share" aria-label="Share note"><i class="fas fa-share-nodes"></i></button>
        <button data-act="del" class="danger" title="Delete" aria-label="Delete note"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');

  box.querySelectorAll('.note-item').forEach((item) => {
    const id = item.dataset.id;
    const note = notes.find((n) => String(n.id) === id);
    item.querySelector('.ni-main').addEventListener('click', () => {
      window.location.href = '/tools#notes';
    });
    item.querySelectorAll('.note-actions button').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const act = btn.dataset.act;
        try {
          if (act === 'pin') {
            await SS.api('/api/tools/notes/' + id, { method: 'PATCH', body: { pinned: !note.pinned } });
            note.pinned = note.pinned ? 0 : 1;
            SS.toast(note.pinned ? 'Note pinned' : 'Note unpinned');
            renderRecentNotes(notes);
          } else if (act === 'fav') {
            await SS.api('/api/tools/notes/' + id, { method: 'PATCH', body: { favorite: !note.favorite } });
            note.favorite = note.favorite ? 0 : 1;
            SS.toast(note.favorite ? 'Added to favorites ⭐' : 'Removed from favorites');
            renderRecentNotes(notes);
          } else if (act === 'dup') {
            await SS.api('/api/tools/notes/' + id + '/duplicate', { method: 'POST' });
            SS.toast('Note duplicated');
            refreshNotes();
          } else if (act === 'share') {
            const text = '📝 ' + note.topic + ' — study note from AI Notebook';
            if (navigator.share) await navigator.share({ title: note.topic, text });
            else { await navigator.clipboard.writeText(text + '\n' + location.origin); SS.toast('Share text copied to clipboard'); }
          } else if (act === 'del') {
            if (!confirm('Delete “' + note.topic + '”?')) return;
            await SS.api('/api/tools/notes/' + id, { method: 'DELETE' });
            SS.toast('Note deleted');
            item.style.transition = 'opacity .25s, transform .25s';
            item.style.opacity = '0'; item.style.transform = 'translateX(24px)';
            setTimeout(() => item.remove(), 260);
          }
        } catch (err) { SS.toast(err.message, 'error'); }
      });
    });
  });
}

async function refreshNotes() {
  try {
    const s = await SS.api('/api/stats');
    renderRecentNotes(s.recent_notes || []);
  } catch { /* ignore */ }
}

/* ---------- Stats ---------- */
function renderStats(s) {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  const cards = [
    { ic: 'fa-book-open-reader', n: s.topics || 0, label: 'Topics started' },
    { ic: 'fa-note-sticky', n: (s.notes || 0) + (s.quizzes || 0), label: 'Notes & quizzes' },
    { ic: 'fa-wand-magic-sparkles', n: s.ai_generations || s.ai_responses || 0, label: 'AI generations' },
    { ic: 'fa-comments', n: s.total_chats || 0, label: 'Total chats' },
  ];
  grid.innerHTML = cards.map((c) => `
    <div class="stat-card glass">
      <div class="ic"><i class="fas ${c.ic}"></i></div>
      <b data-count="${c.n}">0</b>
      <span>${c.label}</span>
    </div>`).join('');
  grid.classList.add('in-view');
  if (window.SSMotion) SSMotion.refresh();
}

/* ---------- Recent chats ---------- */
function renderRecent(chats) {
  const box = document.getElementById('recentChats');
  if (!box) return;
  if (!chats.length) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-comment-dots"></i></div>
        <h4>No chats yet</h4>
        <p>Start your first conversation with the AI tutor.</p>
        <a href="/chat" class="btn small"><i class="fas fa-plus"></i> New chat</a>
      </div>`;
    return;
  }
  box.innerHTML = chats.map((c) => `
    <a class="recent-item" href="/chat?id=${c.id}">
      <span class="ttl"><i class="fas fa-comment"></i> <b>${escapeHtml(c.title)}</b></span>
      <small>${formatDate(c.updated_at)}</small>
    </a>`).join('');
}

/* ---------- Study progress (derived) ---------- */
function renderProgress(s) {
  const activity = s.daily_activity || [];
  const map = {};
  activity.forEach((a) => (map[a.day] = a.count));
  let weekMsgs = 0;
  let streak = 0;
  let streakBroken = false;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const cnt = map[key] || 0;
    weekMsgs += cnt;
    if (cnt > 0 && !streakBroken) streak++;
    else if (cnt === 0 && i > 0) streakBroken = true;
  }

  // Weekly goal heuristic: 50 messages/week = 100%
  const goal = 50;
  const pct = Math.min(100, Math.round((weekMsgs / goal) * 100));

  const ring = document.getElementById('progressRing');
  const pctEl = document.getElementById('progressPct');
  if (ring) setTimeout(() => { ring.style.setProperty('--p', pct); }, 300);
  if (pctEl) { pctEl.dataset.count = pct; }

  const streakEl = document.getElementById('streakVal');
  const weekEl = document.getElementById('weekMsgs');
  if (streakEl) streakEl.textContent = streak + (streak === 1 ? ' day' : ' days');
  if (weekEl) weekEl.textContent = weekMsgs + (weekMsgs === 1 ? ' msg' : ' msgs');
  if (window.SSMotion) SSMotion.refresh();
}

/* ---------- AI usage ---------- */
function renderAiUsage(s) {
  const responses = s.ai_generations || s.ai_responses || 0;
  const total = Math.max(responses, s.total_messages || 0, 1);
  const pct = Math.min(100, Math.round((responses / total) * 100));
  const bar = document.getElementById('aiResponsesBar');
  const num = document.getElementById('aiResponses');
  if (num) { num.dataset.count = responses; num.textContent = '0'; }
  if (bar) setTimeout(() => { bar.style.width = pct + '%'; }, 350);
  if (window.SSMotion) SSMotion.refresh();
}

async function loadProvidersMini() {
  const box = document.getElementById('aiProvidersMini');
  if (!box) return;
  try {
    const data = await SS.api('/api/ai/status', { auth: false });
    box.innerHTML = (data.providers || []).map((p) =>
      `<span class="model-badge" title="${p.label}">` +
      `<span class="model-dot ${p.configured ? '' : 'off'}"></span>` +
      `${p.label}${p.configured ? '' : ' (offline)'}</span>`
    ).join(' ');
    if (!box.innerHTML) box.innerHTML = '<span class="model-badge">No providers</span>';
  } catch {
    box.innerHTML = '<span class="model-badge"><span class="model-dot off"></span> Status unavailable</span>';
  }
}

/* ---------- Achievements (derived from stats) ---------- */
function renderAchievements(s) {
  const box = document.getElementById('achievements');
  if (!box) return;
  const chats = s.total_chats || 0;
  const msgs = s.total_messages || 0;
  const notes = (s.notes || 0) + (s.quizzes || 0);
  const ach = [
    { ic: 'fa-rocket', title: 'First steps', desc: 'Start your first chat', done: chats >= 1 },
    { ic: 'fa-comments', title: 'Conversationalist', desc: 'Send 25 messages', done: msgs >= 25 },
    { ic: 'fa-note-sticky', title: 'Note taker', desc: 'Create 5 notes/quizzes', done: notes >= 5 },
    { ic: 'fa-fire', title: 'On a roll', desc: 'Reach 100 messages', done: msgs >= 100 },
  ];
  box.innerHTML = ach.map((a) => `
    <div class="ach-card glass ${a.done ? 'unlocked' : 'locked'}">
      <span class="ach-ic"><i class="fas ${a.done ? a.ic : 'fa-lock'}"></i></span>
      <div><b>${a.title}</b><span>${a.desc}</span></div>
    </div>`).join('');
  box.classList.add('in-view');
  if (window.SSMotion) SSMotion.refresh();
}

/* ---------- Chart ---------- */
let chartRef = null;
function renderChart(activity) {
  const canvas = document.getElementById('activityChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const days = [];
  const counts = [];
  const map = {};
  activity.forEach((a) => (map[a.day] = a.count));
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    counts.push(map[key] || 0);
  }

  const styles = getComputedStyle(document.documentElement);
  const accent = (styles.getPropertyValue('--accent') || '#7c83ff').trim();
  const textDim = (styles.getPropertyValue('--text-dim') || '#9aa3c7').trim();

  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 240);
  grad.addColorStop(0, hexish(accent, 0.45));
  grad.addColorStop(1, hexish(accent, 0.01));

  if (chartRef) chartRef.destroy();
  chartRef = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Messages',
        data: counts,
        fill: true,
        backgroundColor: grad,
        borderColor: accent,
        borderWidth: 3,
        tension: 0.42,
        pointBackgroundColor: accent,
        pointBorderColor: 'transparent',
        pointRadius: 4,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(14,16,32,0.92)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
          displayColors: false,
        },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: textDim } },
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: textDim, precision: 0 } },
      },
    },
  });
}

/* Convert an hsl()/hex accent to an rgba-ish string with alpha for the gradient */
function hexish(color, alpha) {
  if (color.startsWith('hsl')) {
    return color.replace(')', ` / ${alpha})`).replace('hsl(', 'hsl(');
  }
  // hex fallback
  const c = color.replace('#', '');
  if (c.length === 6) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

/* ---------- Guest banner ---------- */
function showGuestBanner() {
  const banner = document.createElement('div');
  banner.className = 'guest-banner glass';
  banner.innerHTML = `
    <div class="guest-banner-content">
      <div class="guest-banner-text">
        <i class="fas fa-user-secret"></i>
        <div>
          <strong>You're in Guest Mode</strong>
          <p>Your data is temporary. Create an account to save your chats and notes permanently.</p>
        </div>
      </div>
      <a href="/signup" class="btn small primary"><i class="fas fa-user-plus"></i> Create account</a>
    </div>`;
  const content = document.querySelector('.content');
  const topbar = content ? content.querySelector('.topbar') : null;
  if (content && topbar) content.insertBefore(banner, topbar.nextSibling);

  if (!document.getElementById('guest-banner-styles')) {
    const style = document.createElement('style');
    style.id = 'guest-banner-styles';
    style.textContent = `
      .guest-banner { margin: 0 0 1.5rem; padding: 1rem 1.4rem; animation: slideDown .4s ease; }
      .guest-banner-content { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; }
      .guest-banner-text { display:flex; align-items:center; gap:1rem; flex:1; }
      .guest-banner-text i { font-size:1.4rem; color:var(--accent); }
      .guest-banner-text strong { display:block; font-size:1rem; margin-bottom:.15rem; }
      .guest-banner-text p { font-size:.85rem; color:var(--text-dim); margin:0; }
      @media (max-width:600px){ .guest-banner-content{ flex-direction:column; align-items:stretch; } }
    `;
    document.head.appendChild(style);
  }
}

/* ---------- Utils ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatDate(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T') + 'Z');
  if (isNaN(d)) return s;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
