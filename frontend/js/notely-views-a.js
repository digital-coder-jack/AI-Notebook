/* Notely views part 1 — shared pieces and Overview (from Notely app) */
(function () {
  'use strict';
  var I = window.NotelyIcons.icon;

  window.Views = {};

  function pageHeading(o) {
    return '<div class="page-heading"><div>' + (o.eyebrow ? '<p class="eyebrow heading-eyebrow">' + o.eyebrow + '</p>' : '') +
      '<h1>' + o.title + '</h1>' + (o.subtitle ? '<p>' + o.subtitle + '</p>' : '') + '</div>' + (o.action || '') + '</div>';
  }
  window.Views.pageHeading = pageHeading;

  function el(tag, cls, html) { return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + (html || '') + '</' + tag + '>'; }
  window.Views.el = el;

  window.Views.overview = function (nav, toast) {
    return pageHeading({ eyebrow: 'Friday, October 16', title: 'Good morning, Jamie', subtitle: 'A little progress, one idea at a time.' }) +
      el('div', 'home-layout',
        el('div', '',
          el('section', 'continue-card',
            '<p class="eyebrow">Pick up your train of thought</p><p class="course-kicker">Biology 101 · Lecture 07</p><h2>Cellular respiration</h2>' +
            '<p>How does a proton gradient become usable energy? Continue your note before today’s study group.</p>' +
            '<div class="saved-row"><span>8 note pages</span><strong>All changes saved</strong></div>' +
            '<button class="button primary" data-nav="My notebooks">' + I('ArrowUpRight', 15) + ' Continue writing</button>') +
          '<p class="eyebrow home-label">Your notebooks</p>' +
          el('div', 'home-notebooks',
            window.Views.homeNotebook('Mic2', 'Biology 101', 'Prof. Elena Martinez · 8 pages · Updated Oct 14', 'blue', nav) +
            window.Views.homeNotebook('FlaskConical', 'Organic Chemistry', '6 pages · Reaction mechanisms', 'green', nav) +
            window.Views.homeNotebook('Globe2', 'World History', '5 pages · Industrial revolutions', 'orange', nav)) +
          el('section', 'quick-recall',
            '<h2>A quick recall session</h2><p>12 Biology cards are ready for review. Five focused minutes can make the next lecture feel easier.</p>' +
            '<button class="button light" data-nav="Flashcards">' + I('Layers3', 15) + ' Review flashcards</button>')) +
        el('aside', 'home-side',
          el('div', 'side-card calendar-callout',
            '<p class="eyebrow">Today · Oct 16</p><h3>On your calendar</h3><h4>Biology study group</h4><p>3:00–4:00 PM · Library, room 2B</p>' +
            '<button class="button light" data-nav="Calendar">View calendar</button>') +
          el('div', 'side-card',
            '<h3>Coming up</h3>' +
            window.Views.taskMini('Lab report: yeast respiration', 'Biology 101 · Due Oct 17') +
            window.Views.taskMini('Mechanisms problem set', 'Organic Chemistry · Due Oct 19')) +
          el('div', 'side-card rhythm-card',
            '<h3>Your study rhythm</h3><strong>20 / 30 min</strong><div class="progress-line"><i style="width:67%"></i></div>' +
            '<small>Today’s study goal · 10 minutes to go</small><p>A good next step: review the electron transport chain.</p>')));
  };

  window.Views.homeNotebook = function (ico, name, detail, tone, nav) {
    return '<button class="home-notebook ' + tone + '" data-nav="My notebooks"><span class="home-notebook-icon">' + I(ico, 18) +
      '</span><span><strong>' + name + '</strong><small>' + detail + '</small></span>' + I('ArrowUpRight', 15) + '</button>';
  };

  window.Views.taskMini = function (title, detail) {
    return '<div class="task-mini"><span></span><div><strong>' + title + '</strong><small>' + detail + '</small></div></div>';
  };
})();
