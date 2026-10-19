/* Notely app — sidebar, routing, toasts (from Notely app) */
(function () {
  'use strict';
  var I = window.NotelyIcons.icon;
  var V = window.Views;
  var D = window.NotelyData;

  var state = { view: 'Overview', reading: false };
  var viewRoot = document.getElementById('viewRoot');
  var crumb = document.getElementById('crumbView');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function toast(msg) {
    toastEl.innerHTML = I('Check', 16) + msg;
    toastEl.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.hidden = true; }, 2400);
  }
  window.NotelyToast = toast;

  function nav(view) {
    state.view = view;
    if (view !== 'Course materials') state.reading = false;
    render();
    closeSidebar();
  }
  window.NotelyNav = nav;

  function render() {
    var t = window.NotelyToast;
    if (state.view === 'Overview') {
      viewRoot.innerHTML = V.overview(nav, t);
    } else if (state.view === 'My notebooks') {
      viewRoot.innerHTML = V.notebookLibrary(t);
    } else if (state.view === 'Course materials') {
      viewRoot.innerHTML = state.reading ? V.materialReader(t, closeReader) : V.courseMaterials(t, openReader);
    } else if (state.view === 'Flashcards') {
      viewRoot.innerHTML = V.flashcardLibrary(t);
    } else if (state.view === 'Quizzes') {
      viewRoot.innerHTML = V.quizLibrary(t);
    } else if (state.view === 'Tasks') {
      viewRoot.innerHTML = V.tasks(t);
    } else if (state.view === 'Calendar') {
      viewRoot.innerHTML = V.calendar(t);
    } else if (state.view === 'Recorded lectures') {
      viewRoot.innerHTML = V.recordedLectures(t);
    } else if (state.view === 'Study assistant') {
      viewRoot.innerHTML = V.assistant(t);
    } else if (state.view === 'Search') {
      viewRoot.innerHTML = V.search(t);
    } else if (state.view === 'Settings') {
      viewRoot.innerHTML = V.settings(t);
    }
    crumb.textContent = state.view;
  }

  function openReader() { state.reading = true; render(); }
  function closeReader() { state.reading = false; render(); }

  document.addEventListener('click', function (e) {
    var navEl = e.target.closest('[data-nav]');
    if (navEl) return nav(navEl.getAttribute('data-nav'));
    var toastEl2 = e.target.closest('[data-toast]');
    if (toastEl2) return toast(toastEl2.getAttribute('data-toast'));
    if (e.target.closest('[data-open-reader]')) return openReader();
    if (e.target.closest('[data-close-reader]')) return closeReader();
  });

  /* Sidebar build */
  var navEl = document.getElementById('primaryNav');
  navEl.innerHTML = D.navItems.map(function (item) {
    return '<button class="nav-item" data-nav="' + item.label + '">' + I(item.icon, 15) + '<span>' + item.label + '</span></button>';
  }).join('');

  var nbLinks = document.getElementById('notebookLinks');
  nbLinks.innerHTML = D.notebooks.map(function (n) {
    return '<button class="notebook-link ' + n.tone + '" data-nav="My notebooks">' + n.name + '</button>';
  }).join('');

  document.getElementById('brandMark').innerHTML = I('PenLine', 17);
  document.getElementById('searchBtn').insertAdjacentHTML('afterbegin', I('Search', 13));
  document.getElementById('mobileMenu').innerHTML = I('Menu', 19);
  document.getElementById('mobileClose').innerHTML = I('X', 18);

  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('sidebarScrim');
  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    scrim.classList.remove('visible');
  }
  document.getElementById('mobileMenu').addEventListener('click', function () {
    sidebar.classList.add('sidebar-open');
    scrim.classList.add('visible');
  });
  document.getElementById('mobileClose').addEventListener('click', closeSidebar);
  scrim.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      nav('Search');
    }
  });

  render();
})();
