/* Notely views part 3 — Flashcards library and study, Quizzes library and results (from Notely app) */
(function () {
  'use strict';
  var I = window.NotelyIcons.icon;
  var V = window.Views;

  V.flashcardLibrary = function (toast) {
    var cards = ['What is the final electron acceptor?', 'Where does glycolysis occur?', 'What drives ATP synthase?']
      .map(function (c, i) {
        return '<button class="saved-card" data-toast="Opening card ' + (i + 1) + '">' + I('Layers3', 17) + '<span><strong>' + c + '</strong><small>Cellular respiration · Card ' + (i + 7) + ' of 24</small></span>' + I('ArrowUpRight', 15) + '</button>';
      }).join('');
    var decks = [
      V.deckRow('Organic Chemistry', 'Reaction mechanisms · 16 saved cards · 6 due'),
      V.deckRow('World History', 'Industrial revolutions · 8 saved cards · 3 due')
    ].join('');
    return V.pageHeading({ title: 'Flashcards', subtitle: 'Practice remembering, not just rereading.', action: '<button class="button primary" data-toast="New deck created">' + I('Plus', 16) + ' Create deck</button>' }) +
      '<div class="library-tabs"><button class="selected">All courses · 48 saved cards</button><button>Due for review</button><button>My decks</button></div>' +
      '<div class="flash-library-layout"><div>' +
      '<section class="deck-feature"><p class="eyebrow">Biology 101 · Saved deck · 24 cards</p><h2>Energy & metabolism</h2>' +
      '<p>Cellular respiration, enzymes, and the flow of energy through cells.</p>' +
      '<div class="deck-meta"><span><strong>12</strong> due today</span><span>8 learning</span><span>4 new</span></div>' +
      '<div class="progress-line"><i style="width:25%"></i></div>' +
      '<button class="button primary" data-toast="Study session started">' + I('Play', 14) + ' Study 12 due cards</button></section>' +
      decks +
      '<section class="deck-cards"><h2>Inside your Biology deck</h2>' + cards + '</section></div>' +
      '<aside class="flash-library-side"><div class="side-card"><h3>Make a little time stick</h3>' +
      '<p>Start with the due cards. Try to answer aloud before revealing the explanation.</p><p class="eyebrow">Today’s review</p>' +
      '<strong class="large-stat">21 cards</strong><small>Across 3 courses · About 10 minutes</small></div>' +
      '<div class="side-card proposal-card"><p class="warning-text">AI proposal · Not saved</p><h3>8 cards from your latest note</h3>' +
      '<p>Preview the suggested questions before adding anything to your deck.</p>' +
      '<button class="button light" data-toast="Card proposal opened">' + I('Sparkles', 14) + ' Preview proposal</button></div></aside></div>';
  };

  V.deckRow = function (title, detail) {
    return '<button class="deck-row" data-toast="' + title + ' opened">' + I('Layers3', 18) + '<span><strong>' + title + '</strong><small>' + detail + '</small></span>' + I('ArrowUpRight', 15) + '</button>';
  };

  V.flashcardStudy = function (toast) {
    var answer = '<div class="answer"><p class="success-text">Answer revealed</p><h3>Oxygen (O₂).</h3>' +
      '<p>Oxygen accepts electrons at the end of the electron transport chain and combines with H⁺ to form water.</p>' +
      '<small>Source: Ch. 9 — Cellular respiration, p. 7</small></div>';
    var ratings = ['Again · <1 min', 'Hard · 10 min', 'Good · 1 day', 'Easy · 3 days']
      .map(function (r, i) {
        return '<button data-toast="' + r.split(' · ')[0] + ' selected"' + (i === 2 ? ' class="chosen"' : '') + '>' + r + '</button>';
      }).join('');
    return V.pageHeading({ eyebrow: 'Biology 101 / Energy & metabolism', title: 'A moment for recall', subtitle: 'Due-card review · 24 cards in this deck' }) +
      '<div class="review-progress"><span>Card 4 of 12</span><span>33% complete</span><div><i style="width:33%"></i></div></div>' +
      '<div class="flash-layout"><div>' +
      '<section class="flash-card"><p class="eyebrow">Cellular respiration · recall first</p>' +
      '<h2>What is the final electron acceptor in cellular respiration?</h2><div class="flash-divider"></div>' + answer + '</section>' +
      '<p class="rating-label">How well did you remember this?</p><div class="rating-row">' + ratings + '</div></div>' +
      '<aside class="session-sidebar"><div class="side-card"><h3>Your session</h3><p>3 reviewed · 9 remaining</p><p>2 remembered well · 1 needs another look</p>' +
      '<small>No rush. Thinking before revealing is the useful part.</small></div>' +
      '<button class="button light" data-toast="Review paused">Pause review</button>' +
      '<div class="side-card"><h3>Connected to your note</h3><p>Cellular respiration</p><small>Lecture 07 · October 14, 2026</small>' +
      '<button class="button light" data-toast="Opening source note">Open source note</button></div></aside></div>';
  };

  V.quizLibrary = function (toast) {
    var quizzes = [
      { title: 'Enzymes & energy', detail: 'Biology 101 · 8 questions · ~10 minutes' },
      { title: 'Metabolism — unit review', detail: 'Biology 101 · 12 questions · ~15 minutes' },
      { title: 'Reaction mechanisms', detail: 'Organic Chemistry · 10 questions' },
      { title: 'Industrial revolutions', detail: 'World History · 8 questions' }
    ];
    var rows = quizzes.map(function (q, i) {
      return '<button class="quiz-library-row" data-toast="' + q.title + ' opened">' + I('CheckCircle2', 17) + '<span><strong>' + q.title + '</strong><small>' + q.detail + '</small><em>' + (i < 2 ? 'Ready to practice' : '') + '</em></span>' + I('ArrowUpRight', 15) + '</button>';
    }).join('');
    var sources = V.sourceMini('Cellular respiration', 'Lecture 07 · Note') + V.sourceMini('Ch. 9 — Cellular respiration', '18-page PDF · 6 annotations');
    return V.pageHeading({ title: 'Quizzes', subtitle: 'Find what you understand — and what to revisit.', action: '<button class="button primary" data-toast="Quiz creator opened">' + I('Plus', 16) + ' Create quiz</button>' }) +
      '<div class="library-tabs"><button class="selected">Biology 101 · 3 quizzes</button><button>All courses · 6</button><button>Practice</button></div>' +
      '<div class="quiz-library-layout"><div>' +
      '<section class="quiz-feature"><p class="eyebrow">Biology 101 · Practice quiz</p><h2>Cellular respiration</h2>' +
      '<p>Trace the pathway from glucose to ATP and check your understanding of chemiosmosis.</p>' +
      '<div class="deck-meta"><span>5 questions</span><span>~6 minutes</span><strong>Source-grounded</strong></div>' +
      '<button class="button primary" data-toast="Demo attempt opened">' + I('Play', 14) + ' Open demo attempt</button>' +
      '<small>Demo attempt A · One shared sample across practice and results</small></section>' +
      '<div class="quiz-list">' + rows + '</div></div>' +
      '<aside class="quiz-library-side"><div class="side-card"><h3>Practice with purpose</h3>' +
      '<p>Answer without looking at your notes. Use the explanations afterward to connect the ideas.</p>' +
      '<small>Practice quizzes are for you. They are not graded coursework.</small></div>' +
      '<div class="side-card"><h3>Your sources</h3>' + sources + '</div>' +
      '<div class="side-card"><p class="warning-text">Demo attempt A</p><p>The example attempt uses 5 questions. Its completed result is 4 / 5, with question 3 marked for review.</p></div></aside></div>';
  };

  V.sourceMini = function (title, detail) {
    return '<div class="source-mini">' + I('FileText', 16) + '<span><strong>' + title + '</strong><small>' + detail + '</small></span></div>';
  };

  V.quizResults = function (toast) {
    var answers = ['Cytoplasm', 'Mitochondrial matrix', 'Inner mitochondrial membrane', 'Nucleus'];
    var questions = ['Where does glycolysis occur?', 'What is the net ATP yield of glycolysis?', 'What builds the proton gradient?', 'What stops when oxygen is unavailable?', 'What is the final electron acceptor?'];
    var rows = questions.map(function (q, i) {
      var missed = i === 2;
      return '<div class="answer-row' + (missed ? ' missed' : '') + '"><div class="answer-number">' + (i + 1) + '</div><div><h3>' + q + '</h3>' +
        '<span class="' + (missed ? 'warning-text' : 'success-text') + '">' + (missed ? 'Needs review' : 'Understood') + '</span>' +
        '<p><strong>Your answer: </strong>' + answers[i % answers.length] + ' · ' + (missed ? 'Incorrect' : 'Correct') + '</p>' +
        '<small>' + (missed ? 'Correct answer: The electron transport chain. ETC complexes use electron energy to pump H⁺; ATP synthase uses the gradient.' : 'A concise explanation from your course notes, linked to the source page.') + '</small></div></div>';
    }).join('');
    return V.pageHeading({ eyebrow: 'Biology 101 / Quizzes', title: 'A clearer picture', subtitle: 'Cellular respiration · Demo attempt A · Completed Oct 16', action: '<button class="button light" data-toast="Starting a new attempt">' + I('Plus', 15) + ' New attempt</button>' }) +
      '<div class="quiz-layout"><div>' +
      '<section class="score-card"><div><p class="eyebrow">Demo attempt A · Results</p><h2>4 / 5 <span>correct</span></h2><p>80% · Completed in 05:42</p>' +
      '<small>You’ve got the pathway. Revisit the difference between building the proton gradient and using it.</small></div>' +
      '<div class="score-ring">80%</div></section>' +
      '<div class="answers-list">' + rows + '</div></div>' +
      '<aside class="quiz-sidebar"><div class="side-card"><h3>Turn a gap into a connection</h3>' +
      '<p>Add the ETC vs. ATP synthase distinction to your Cellular respiration note.</p>' +
      '<button class="button primary" data-toast="Explanation added to note">' + I('Sparkles', 15) + ' Add explanation</button>' +
      '<button class="button light" data-toast="Related cards opened">Review related cards</button></div>' +
      '<div class="side-card"><h3>Keep practicing</h3><p>Try this quiz again as a new attempt when you’re ready.</p>' +
      '<button class="button light" data-toast="Starting a new attempt">Start a new attempt</button></div></aside></div>';
  };
})();
