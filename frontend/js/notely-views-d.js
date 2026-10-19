/* Notely views part 4 — Calendar, Tasks, Study assistant (from Notely app) */
(function () {
  'use strict';
  var I = window.NotelyIcons.icon;
  var V = window.Views;

  V.calendar = function (toast) {
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d) { return V.el('span', '', d); }).join('');
    var cells = '';
    for (var i = 0; i < 35; i++) {
      cells += V.el('div', i === 18 ? 'today' : '', i > 3 && i < 35 ? String(i - 3) : '');
    }
    var events = [
      { tone: 'lavender', title: 'Biology study group', time: '3:00–4:00 PM', place: 'Library, room 2B', detail: 'Review cellular respiration and compare lab observations with your group.', btn: 'Open Biology notebook' },
      { title: 'Evening recall', time: '6:00–6:30 PM', place: 'Personal study session', detail: 'Review due Biology flashcards and finish the lab report discussion.', btn: 'Open flashcards' },
      { warn: true, title: 'Tomorrow’s deadline', time: 'OCT 17 · 11:59 PM', place: 'Lab report: yeast respiration', detail: 'Biology 101 · 2 checklist items remaining', btn: 'View task' }
    ];
    var cards = events.map(function (e) {
      return '<article class="event-card ' + (e.tone || '') + '"><h3>' + e.title + '</h3><strong' + (e.warn ? ' class="warning-text"' : '') + '>' + e.time + '</strong>' +
        '<p>' + e.place + '</p><p>' + e.detail + '</p><button class="button light" data-toast="' + e.btn + '">' + e.btn + '</button></article>';
    }).join('');
    return V.pageHeading({ title: 'Calendar', subtitle: 'Coursework and study time, in one view.', action: '<button class="button primary" data-toast="New event form opened">' + I('Plus', 16) + ' Add event</button>' }) +
      '<div class="calendar-head"><button class="icon-button">' + I('ChevronLeft', 17) + '</button><h2>October 2026</h2><button class="icon-button">' + I('ChevronRight', 17) + '</button>' +
      '<div class="calendar-views"><button>Today</button><button>Week</button><button class="active">Month</button></div></div>' +
      '<div class="month-grid">' + days + cells + '</div>' +
      '<p class="eyebrow date-label">Friday, October 16 · Today</p><div class="event-grid">' + cards + '</div>';
  };

  V.tasks = function (toast) {
    var groups = [
      { label: 'Tomorrow · October 17', items: [['Lab report: yeast respiration', 'Biology 101 · Due Oct 17, 11:59 PM', true]] },
      { label: 'Monday · October 19', items: [['Mechanisms problem set', 'Organic Chemistry · Due Oct 19, 9:00 AM', false]] },
      { label: 'Tuesday · October 20', items: [['Read Ch. 10 — Photosynthesis', 'Biology 101 · Due Oct 20, 10:00 AM', false]] },
      { label: 'Wednesday · October 21', items: [['Industrialization essay outline', 'World History · Due Oct 21, 5:00 PM', false]] }
    ];
    var list = groups.map(function (g) {
      var rows = g.items.map(function (it) {
        return '<button class="task-row' + (it[2] ? ' active' : '') + '" data-toast="' + it[0] + ' selected">' + I('Check', 18) + '<span><strong>' + it[0] + '</strong><small>' + it[1] + '</small>' + (it[2] ? V.el('em', '', 'In progress') : '') + '</span></button>';
      }).join('');
      return '<section class="task-group">' + V.el('p', 'eyebrow', g.label) + rows + '</section>';
    }).join('');
    return V.pageHeading({ title: 'Tasks', subtitle: 'Give every deadline a place, and your mind a little room.', action: '<button class="button primary" data-toast="New task created">' + I('Plus', 16) + ' New task</button>' }) +
      '<div class="task-tabs"><strong>Upcoming · 4</strong><span>Completed</span><span>All courses</span><span>By due date ↓</span></div>' +
      '<div class="tasks-layout"><div>' + list +
      '<section class="task-group">' + V.el('p', 'eyebrow', 'Recently completed') +
      '<button class="task-row" data-toast="Completed task opened">' + I('CheckCircle2', 18) + '<span><strong>Annotate Ch. 9 — Cellular respiration</strong><small>Biology 101 · Completed Oct 14 · 6 annotations</small></span></button></section></div>' +
      '<aside class="task-side"><div class="side-card task-detail">' + V.el('h3', '', 'Lab report: yeast respiration') +
      '<p class="eyebrow">Biology 101</p><p>Compare CO₂ production under aerobic and anaerobic conditions. Explain the relationship to ATP yield.</p>' +
      '<strong>Due date</strong><div class="detail-field">October 17, 2026 · 11:59 PM</div>' +
      '<p class="eyebrow">Checklist · 1 of 3 complete</p>' +
      '<label class="filter-check"><input type="checkbox" checked>Organize observations</label>' +
      '<label class="filter-check"><input type="checkbox">Draft results and discussion</label>' +
      '<label class="filter-check"><input type="checkbox">Add references and proofread</label>' +
      V.sourceMini('Lab: yeast respiration', 'Linked Biology note') +
      '<strong>Reminder</strong><div class="detail-field">October 17 · 6:00 PM</div>' +
      '<button class="button primary" data-toast="Task marked complete">' + I('Check', 14) + ' Mark complete</button></div>' +
      '<div class="side-card task-nudge"><p>Study group today at 3:00 PM? Bring your lab questions along.</p>' +
      '<button class="button light" data-nav="Calendar">View calendar</button></div></aside></div>';
  };

  V.assistant = function (toast) {
    var conversations = '<button class="conversation active" data-toast="Conversation opened">' + I('MessageSquare', 16) + '<span><strong>ATP and oxygen</strong><small>Today · Biology 101</small></span></button>' +
      '<button class="conversation" data-toast="Conversation opened">' + I('MessageSquare', 16) + '<span><strong>Enzyme activation energy</strong><small>Oct 14 · Biology 101</small></span></button>';
    var sources = ['Cellular respiration · Current note · Lecture 07', 'Ch. 9 — Cellular respiration · PDF · 18 pages', 'Lecture 07 · 42 min · Transcript ready']
      .map(function (s) {
        var p = s.split(' · ');
        return '<button class="assistant-source" data-toast="Opening ' + p[0] + '">' + I('FileText', 15) + '<span><strong>' + p[0] + '</strong><small>' + p.slice(1).join(' · ') + '</small></span></button>';
      }).join('');
    var steps = [
      ['The electron chain backs up', 'Without O₂ to accept electrons at the end of the chain, electron transfer cannot keep running. [1]'],
      ['The H⁺ gradient fades', 'Proton pumping stops. ATP synthase loses the gradient that powers ATP synthesis. [1, 2]'],
      ['Glycolysis can still make ATP', 'If fermentation regenerates NAD⁺, glycolysis can continue to yield net 2 ATP per glucose. [1]']
    ].map(function (s, i) {
      return '<div class="assistant-step">' + V.el('span', '', String(i + 1)) + '<div><strong>' + s[0] + '</strong><p>' + s[1] + '</p></div></div>';
    }).join('');
    return V.pageHeading({ title: 'Study assistant', subtitle: 'A study partner grounded in your course, not a shortcut.' }) +
      '<div class="assistant-layout"><aside class="conversation-side">' +
      '<button class="button light" data-toast="New conversation started">' + I('PenLine', 14) + ' New conversation</button>' +
      V.el('p', 'eyebrow', 'Recent conversations') + conversations +
      V.el('p', 'eyebrow', 'Grounded in your course') + sources + '</aside>' +
      '<div class="assistant-main"><small class="assistant-time">Today · 10:42 AM</small>' +
      V.el('div', 'assistant-question', 'Why does ATP production stop without oxygen?') +
      '<p class="source-label">✧ Notely · Answer with sources</p>' +
      '<p class="assistant-intro">Almost! It’s oxidative phosphorylation that stops, not all ATP production. Here’s the chain reaction:</p>' +
      steps +
      '<div class="source-citations"><p class="eyebrow">Source citations</p><p>[1] Ch. 9 — Cellular respiration · p. 7</p><p>[2] Lecture 07 · 12:34–14:02</p>' +
      '<small>Sources are from your Biology 101 materials.</small></div>' +
      '<div class="assistant-actions"><button class="button light" data-toast="Answer inserted into note">' + I('PenLine', 14) + ' Insert into note</button>' +
      '<button class="button light" data-toast="Answer copied">' + I('FileText', 14) + ' Copy answer</button></div>' +
      '<section class="make-stick"><h2>Make it stick</h2><p class="eyebrow">8 proposed flashcards · Not saved</p>' +
      '<p>Preview this AI-generated set before adding it to your Biology deck.</p>' +
      '<div class="proposed-card"><p class="eyebrow">Proposed card</p><h3>What is the final electron acceptor in cellular respiration?</h3><p>Oxygen (O₂), which is reduced to water.</p></div>' +
      '<button class="button light" data-toast="Proposed cards opened">' + I('Layers3', 14) + ' Review 8 proposed cards</button>' +
      '<small>24 saved Biology cards · This proposal hasn’t changed your deck.</small></section>' +
      '<div class="assistant-composer"><span>Ask about your notes or materials...</span>' +
      '<div>' + I('Paperclip', 15) + I('Mic2', 15) + '<button class="button primary" data-toast="Question sent">↑ Send</button></div></div>' +
      '<small class="composer-note">Always check your sources. AI can make mistakes.</small></div></div>';
  };
})();
