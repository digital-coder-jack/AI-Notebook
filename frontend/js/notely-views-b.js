/* Notely views part 2 — My notebooks and Course materials (from Notely app) */
(function () {
  'use strict';
  var I = window.NotelyIcons.icon;
  var V = window.Views;

  V.notebookLibrary = function (toast) {
    var courses = [
      { name: 'Biology 101', meta: 'Prof. Elena Martinez', stats: '8 note pages · 12 materials', cards: '24 flashcards · 3 quizzes', last: 'Cellular respiration', tone: 'blue' },
      { name: 'Organic Chemistry', meta: 'Chemistry · Fall 2026', stats: '6 note pages · 7 materials', cards: '16 flashcards · 2 quizzes', last: 'Reaction mechanisms', tone: 'green' },
      { name: 'World History', meta: 'Humanities · Fall 2026', stats: '5 note pages · 5 materials', cards: '8 flashcards · 1 quizzes', last: 'Industrial revolutions', tone: 'orange' }
    ];
    var cards = courses.map(function (c) {
      return '<article class="course-notebook ' + c.tone + '"><p class="eyebrow">Fall semester 2026</p><h2>' + c.name + '</h2><p>' + c.meta + '</p>' +
        '<span>' + c.stats + '</span><span>' + c.cards + '</span>' +
        '<div class="last-opened"><p class="eyebrow">Last opened</p><h3>' + c.last + '</h3><small>Continue from your last note</small></div>' +
        '<button class="button light" data-nav="My notebooks">' + I('ArrowUpRight', 14) + ' Open notebook</button></article>';
    }).join('');
    var pages = ['Cellular respiration · Biology 101 · Lecture 07 · October 14, 2026', 'Lab: yeast respiration · Biology 101 · Lab notes · October 15, 2026', 'Substitution vs. elimination · Organic Chemistry · October 13, 2026']
      .map(function (p) {
        var parts = p.split(' · ');
        return '<button data-toast="Opening recent page">' + I('FileText', 16) + '<span>' + parts[0] + '<small>' + parts.slice(1).join(' · ') + '</small></span>' + I('ArrowUpRight', 14) + '</button>';
      }).join('');
    return V.pageHeading({ title: 'My notebooks', subtitle: 'A home for every course, and every connection you make.', action: '<button class="button primary" data-toast="New notebook created">' + I('Plus', 16) + ' New notebook</button>' }) +
      '<div class="library-tabs"><button class="selected">Fall semester 2026</button><button>All notebooks · 3</button><button>Recently updated ↓</button></div>' +
      '<div class="notebook-cards-grid">' + cards + '</div>' +
      '<p class="eyebrow recent-label">Recent pages</p><div class="recent-pages">' + pages + '</div>' +
      '<p class="materials-count">19 note pages across 3 notebooks · Your work is synced and private.</p>';
  };

  V.courseMaterials = function (toast, openReader) {
    var materials = [
      { icon: 'FileText', title: 'Ch. 9 — Cellular respiration', detail: 'PDF · 18 pages · Added Oct 14', extra: '6 annotations', selected: true },
      { icon: 'GraduationCap', title: 'Lecture 07 — Energy & metabolism', detail: 'Slides · 32 slides · Added Oct 14' },
      { icon: 'FileText', title: 'Yeast respiration — lab guide', detail: 'PDF · 6 pages · Added Oct 13' },
      { icon: 'FileText', title: 'Ch. 10 — Photosynthesis', detail: 'PDF · 22 pages · Added Oct 15' },
      { icon: 'Link2', title: 'ATP synthase: a molecular motor', detail: 'Web resource · OpenStax Biology' },
      { icon: 'FileText', title: 'Metabolism — midterm reading list', detail: 'Document · 3 pages · Added Oct 12' }
    ];
    var rows = materials.map(function (m) {
      var act = m.selected ? ' data-open-reader="1"' : ' data-toast="' + m.title + ' selected"';
      return '<button class="material-row' + (m.selected ? ' selected' : '') + '"' + act + '>' + V.el('span', '', V.el('span', 'icon-holder', I(m.icon, 18)) +
        '<span><strong>' + m.title + '</strong><small>' + m.detail + '</small>' + (m.extra ? '<em>' + m.extra + '</em>' : '') + '</span>') + I('ArrowUpRight', 15) + '</button>';
    }).join('');
    return V.pageHeading({ title: 'Course materials', subtitle: 'Readings, slides, and references — close to your notes.', action: '<button class="button primary" data-toast="Upload picker opened">' + I('Plus', 16) + ' Add material</button>' }) +
      '<div class="material-tabs"><button class="selected">Biology 101 · 12</button><button>All courses · 24</button><button>PDFs</button><button>Slides</button><button>Links</button></div>' +
      '<div class="materials-layout"><div>' +
      '<p class="eyebrow materials-label">Biology 101 · Recently added</p><div class="material-list">' + rows + '</div>' +
      '<p class="materials-count">Showing 6 of 12 Biology materials · View all materials →</p></div>' +
      '<aside class="materials-side"><div class="side-card upload-card">' + I('UploadCloud', 24) +
      '<h3>Bring your sources in</h3><p>Upload PDFs, lecture slides, or documents. Link them to a course so your assistant can cite them.</p>' +
      '<button class="button primary" data-toast="Upload picker opened">' + I('UploadCloud', 14) + ' Choose files</button>' +
      '<button class="button light" data-toast="Link form opened">' + I('Link2', 14) + ' Add a link</button>' +
      '<small>PDF, PPTX, DOCX · Up to 50 MB per file</small></div>' +
      '<div class="side-card"><p class="eyebrow">Selected material</p><h3>Ch. 9 — Cellular respiration</h3>' +
      '<p>18 pages · 6 annotations · Linked to Cellular respiration</p><small>Ready for reading and grounded AI answers.</small>' +
      '<button class="button light" data-open-reader="1">' + I('BookOpen', 14) + ' Open PDF</button></div></aside></div>';
  };

  V.materialReader = function (toast, closeReader) {
    var citations = '<div class="annotation-card selected"><p class="eyebrow">Page 7 · Highlight selected</p><q>“Oxygen is the final electron acceptor...”</q>' +
      '<p>Jamie Lee · Oct 14</p><p>Important: oxygen isn’t directly making ATP. It keeps electrons moving.</p>' +
      '<button class="button light" data-toast="Highlight added to note">' + I('PenLine', 14) + ' Add to note</button></div>' +
      '<div class="annotation-card"><p class="eyebrow">Page 7 · Comment</p><p>Compare this gradient with a dam storing potential energy.</p>' +
      '<small>Linked note: Cellular respiration</small></div>' +
      '<div class="annotation-card"><p class="eyebrow">Page 4 · Highlight</p><p>Glycolysis produces a net yield of 2 ATP.</p></div>';
    return V.pageHeading({ eyebrow: 'Course materials / PDF', title: 'Ch. 9 — Cellular respiration', subtitle: 'Biology 101 · PDF · 18 pages · 6 annotations', action: '<button class="button light" data-close-reader="1">' + I('ChevronLeft', 15) + ' Back to materials</button>' }) +
      '<div class="reader-toolbar"><span>7 / 18</span><span>' + I('MousePointer2', 16) + ' ' + I('Highlighter', 16) + ' ' + I('MessageSquare', 16) + ' ' + I('ZoomIn', 16) + '</span><span>100%</span></div>' +
      '<div class="reader-layout"><article class="pdf-page"><p class="eyebrow">Chapter 9 · Cellular respiration</p>' +
      '<h2>Oxidative phosphorylation and chemiosmosis</h2>' +
      '<p>Electrons carried by NADH and FADH₂ pass through a series of protein complexes embedded in the inner mitochondrial membrane. Their energy is used to move protons against a concentration gradient.</p>' +
      '<blockquote>Oxygen is the final electron acceptor in the electron transport chain. It combines with electrons and protons to form water.</blockquote>' +
      '<p>The resulting electrochemical gradient stores potential energy. As protons flow back into the matrix through ATP synthase, the enzyme catalyzes the phosphorylation of ADP.</p>' +
      '<div class="gradient-figure"><span>INTERMEMBRANE SPACE · HIGH H⁺</span><div class="proton-line">H⁺　 　　 H⁺　　　 H⁺　　　H⁺　　　 H⁺</div>' +
      '<strong>ETC ↑ pumps H⁺　 ↓ ATP synthase</strong><strong>ADP + Pᵢ → ATP</strong><small>MATRIX · LOW H⁺</small></div>' +
      '<small>Figure 9.6 · The proton gradient couples electron transport to ATP synthesis.</small>' +
      '<p>Without oxygen, electron transport halts and the gradient dissipates. Glycolysis may continue if fermentation regenerates NAD⁺, producing a net two ATP per glucose.</p>' +
      '<footer>BIOLOGY 101 READING EXCERPT <span>7</span></footer></article>' +
      '<aside class="annotation-side"><div class="annotation-heading">Annotations<span>6 total</span></div>' + citations +
      '<button class="button light" data-toast="Annotations opened">View all 6 annotations</button>' +
      '<button class="button primary" data-toast="AI selection assistant opened">' + I('Sparkles', 14) + ' Ask AI about selection</button></aside></div>';
  };
})();
