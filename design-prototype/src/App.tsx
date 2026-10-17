import { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Tag,
  X,
} from 'lucide-react';

type View = 'notebooks' | 'recent' | 'starred' | 'calendar' | 'study' | 'settings';

type Notebook = {
  title: string;
  description: string;
  notes: number;
  updated: string;
  color: string;
  icon: string;
};

const notebooks: Notebook[] = [
  { title: 'Biology 101', description: 'Cell biology, genetics, and evolution', notes: 24, updated: '2 hours ago', color: 'blue', icon: 'B' },
  { title: 'Organic Chemistry', description: 'Reactions, mechanisms, and synthesis', notes: 18, updated: 'Yesterday', color: 'amber', icon: 'OC' },
  { title: 'Product ideas', description: 'Thoughts and inspiration for future projects', notes: 12, updated: '3 days ago', color: 'mint', icon: 'PI' },
];

const recentNotes = [
  { title: 'Cellular respiration', notebook: 'Biology 101', date: 'Today, 10:42 AM', preview: 'The process by which cells convert glucose into ATP...' },
  { title: 'A note for myself', notebook: 'Product ideas', date: 'Yesterday, 4:18 PM', preview: 'What is the best way to make learning feel more...' },
  { title: 'Questions to revisit', notebook: 'Organic Chemistry', date: 'Mon, 9:30 AM', preview: 'Review the relationship between stereochemistry and...' },
];

const navItems: { label: string; icon: typeof LayoutGrid; view: View }[] = [
  { label: 'All notebooks', icon: LayoutGrid, view: 'notebooks' },
  { label: 'Recent notes', icon: Clock3, view: 'recent' },
  { label: 'Starred', icon: Star, view: 'starred' },
  { label: 'Calendar', icon: CalendarDays, view: 'calendar' },
];

function App() {
  const [view, setView] = useState<View>('notebooks');
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [query, setQuery] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const filteredNotebooks = useMemo(
    () => notebooks.filter((notebook) => notebook.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const openNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setMobileNav(false);
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    setSelectedNotebook(null);
    setMobileNav(false);
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button className="icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="brand"><span className="brand-mark"><BrainCircuit size={17} /></span><span>AI Notebook</span></div>
        <button className="icon-button" onClick={() => setShowNewNote(true)} aria-label="Create note"><Plus size={20} /></button>
      </header>

      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand"><span className="brand-mark"><BrainCircuit size={17} /></span><span>AI Notebook</span></div>
          <button className="close-nav icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <button className="new-note-button" onClick={() => setShowNewNote(true)}><Plus size={17} /> New note <span className="shortcut">N</span></button>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, view: itemView }) => (
            <button className={`nav-item ${view === itemView && !selectedNotebook ? 'active' : ''}`} key={itemView} onClick={() => changeView(itemView)}>
              <Icon size={17} /><span>{label}</span>{itemView === 'starred' && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-section-title"><span>Workspaces</span><button className="tiny-button" aria-label="Add workspace"><Plus size={15} /></button></div>
        <div className="workspace-list">
          {notebooks.map((notebook) => <button className={`workspace-item ${selectedNotebook?.title === notebook.title ? 'active' : ''}`} key={notebook.title} onClick={() => openNotebook(notebook)}><span className={`workspace-dot ${notebook.color}`} />{notebook.title}<span className="workspace-more"><MoreHorizontal size={14} /></span></button>)}
        </div>
        <div className="sidebar-bottom">
          <button className={`nav-item ${view === 'study' ? 'active' : ''}`} onClick={() => changeView('study')}><Lightbulb size={17} /><span>Study tools</span><span className="new-pill">NEW</span></button>
          <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => changeView('settings')}><Settings size={17} /><span>Settings</span></button>
          <div className="profile-card"><div className="avatar">AM</div><div><strong>Alex Morgan</strong><span>Personal workspace</span></div><ChevronDown size={15} /></div>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /> <strong>{selectedNotebook?.title ?? pageTitle(view)}</strong></div>
          <div className="topbar-actions"><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your workspace" /><span className="search-shortcut">⌘ K</span></label><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><div className="avatar small">AM</div></div>
        </div>
        {selectedNotebook ? <NotebookView notebook={selectedNotebook} onBack={() => setSelectedNotebook(null)} onNewNote={() => setShowNewNote(true)} /> : <ViewContent view={view} notebooks={filteredNotebooks} query={query} onOpenNotebook={openNotebook} onNewNote={() => setShowNewNote(true)} />}
      </main>
      {showNewNote && <NewNoteModal onClose={() => setShowNewNote(false)} />}
    </div>
  );
}

function pageTitle(view: View) {
  return { notebooks: 'All notebooks', recent: 'Recent notes', starred: 'Starred', calendar: 'Calendar', study: 'Study tools', settings: 'Settings' }[view];
}

function ViewContent({ view, notebooks: visibleNotebooks, query, onOpenNotebook, onNewNote }: { view: View; notebooks: Notebook[]; query: string; onOpenNotebook: (notebook: Notebook) => void; onNewNote: () => void }) {
  if (view === 'study') return <StudyView />;
  if (view === 'settings') return <SettingsView />;
  if (view === 'calendar') return <CalendarView />;
  const showingNotes = view === 'recent' || view === 'starred';
  return <div className="page-wrap"><div className="page-heading"><div><p className="eyebrow">Good morning, Alex</p><h1>{showingNotes ? pageTitle(view) : 'Your notebooks'}</h1><p className="subtitle">{showingNotes ? 'Pick up where you left off.' : 'A calm place for all your thoughts and ideas.'}</p></div><button className="primary-button" onClick={onNewNote}><Plus size={17} /> New note</button></div>
    {showingNotes ? <RecentNotes /> : <><div className="section-heading"><h2>{query ? 'Search results' : 'All notebooks'}</h2><span>{visibleNotebooks.length} notebooks</span></div><div className="notebook-grid">{visibleNotebooks.map((notebook) => <NotebookCard notebook={notebook} key={notebook.title} onClick={() => onOpenNotebook(notebook)} />)}<button className="create-card" onClick={onNewNote}><span><Plus size={20} /></span><strong>Create a notebook</strong><small>Start a new space for your ideas</small></button></div><div className="lower-grid"><RecentNotes /><QuickStart /></div></>}
  </div>;
}

function NotebookCard({ notebook, onClick }: { notebook: Notebook; onClick: () => void }) {
  return <button className="notebook-card" onClick={onClick}><div className="card-top"><span className={`notebook-icon ${notebook.color}`}>{notebook.icon}</span><MoreHorizontal size={18} className="muted-icon" /></div><div className="notebook-info"><h3>{notebook.title}</h3><p>{notebook.description}</p></div><div className="card-footer"><span><FileText size={14} /> {notebook.notes} notes</span><span>{notebook.updated}</span></div></button>;
}

function RecentNotes() {
  return <section className="recent-section"><div className="section-heading"><h2>Recent notes</h2><button className="text-button">View all <ChevronRight size={15} /></button></div><div className="notes-list">{recentNotes.map((note, index) => <button className="note-row" key={note.title}><span className={`note-icon note-${index}`}><StickyNote size={16} /></span><span className="note-copy"><strong>{note.title}</strong><small>{note.preview}</small></span><span className="note-meta"><span>{note.notebook}</span><time>{note.date}</time></span><ChevronRight size={16} className="row-arrow" /></button>)}</div></section>;
}

function QuickStart() {
  return <section className="quick-start"><div className="quick-header"><span className="sparkle-box"><Sparkles size={17} /></span><div><h3>Make the most of your notes</h3><p>Try one of these to get started</p></div></div><div className="quick-options"><button><BrainCircuit size={17} /><span><strong>Ask your notes</strong><small>Get answers from your workspace</small></span><ChevronRight size={15} /></button><button><Lightbulb size={17} /><span><strong>Generate a study guide</strong><small>Turn notes into a learning plan</small></span><ChevronRight size={15} /></button></div></section>;
}

function NotebookView({ notebook, onBack, onNewNote }: { notebook: Notebook; onBack: () => void; onNewNote: () => void }) {
  return <div className="page-wrap notebook-page"><button className="back-button" onClick={onBack}>← All notebooks</button><div className="page-heading notebook-heading"><div><div className={`notebook-icon large ${notebook.color}`}>{notebook.icon}</div><p className="eyebrow">Notebook</p><h1>{notebook.title}</h1><p className="subtitle">{notebook.description}</p></div><div className="heading-actions"><button className="secondary-button"><Star size={16} /> Star</button><button className="primary-button" onClick={onNewNote}><Plus size={17} /> New note</button></div></div><div className="notebook-toolbar"><span>{notebook.notes} notes</span><button className="sort-button">Recently updated <ChevronDown size={15} /></button></div><div className="note-detail-grid">{recentNotes.concat([{ title: 'Key concepts and definitions', notebook: notebook.title, date: 'Last week', preview: 'A collection of the most important concepts from this notebook...' }]).map((note, index) => <article className="detail-note" key={`${note.title}-${index}`}><div className="detail-note-head"><span className={`note-icon note-${index % 3}`}><StickyNote size={16} /></span><time>{note.date}</time><MoreHorizontal size={17} /></div><h3>{note.title}</h3><p>{note.preview}</p><div className="note-tag"><Tag size={12} /> {note.notebook}</div></article>)}</div></div>;
}

function StudyView() {
  return <div className="page-wrap"><div className="page-heading"><div><p className="eyebrow">Learn smarter</p><h1>Study tools</h1><p className="subtitle">Turn your notes into active learning.</p></div></div><div className="study-grid"><div className="study-hero"><span className="study-hero-icon"><BrainCircuit size={27} /></span><h2>Your knowledge, amplified.</h2><p>Choose a notebook and let AI create a personalized study experience from your own notes.</p><button className="primary-button">Choose a notebook <ChevronRight size={16} /></button></div>{[['Flashcards', 'Practice key concepts with spaced repetition', BrainCircuit], ['Quiz me', 'Test your understanding with adaptive questions', HelpCircle], ['Study guide', 'Get a clear plan for your next study session', BookOpen]].map(([title, description, Icon]) => <button className="study-tool-card" key={title as string}><span><Icon size={20} /></span><strong>{title as string}</strong><p>{description as string}</p><ChevronRight size={16} /></button>)}</div></div>;
}

function CalendarView() {
  return <div className="page-wrap"><div className="page-heading"><div><p className="eyebrow">Your rhythm</p><h1>Calendar</h1><p className="subtitle">See your note-taking activity at a glance.</p></div><button className="secondary-button"><CalendarDays size={16} /> October 2026 <ChevronDown size={14} /></button></div><div className="calendar-card"><div className="calendar-week"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div className="calendar-days">{Array.from({ length: 35 }, (_, index) => <div className={`${index === 16 ? 'today' : ''} ${[4, 9, 16, 23, 28].includes(index) ? 'has-note' : ''}`} key={index}>{index < 3 ? '' : index - 2}</div>)}</div></div></div>;
}

function SettingsView() {
  return <div className="page-wrap narrow-page"><div className="page-heading"><div><p className="eyebrow">Workspace</p><h1>Settings</h1><p className="subtitle">Manage your preferences and workspace.</p></div></div><div className="settings-card"><div className="settings-row"><div><strong>Workspace name</strong><span>How your workspace appears in the sidebar</span></div><input defaultValue="Alex's workspace" /></div><div className="settings-row"><div><strong>Daily reminder</strong><span>Get a gentle nudge to keep your notes growing</span></div><button className="toggle on"><i /></button></div><div className="settings-row"><div><strong>Compact note cards</strong><span>Show more notes on the screen at once</span></div><button className="toggle"><i /></button></div><div className="settings-row"><div><strong>Account email</strong><span>alex.morgan@example.com</span></div><button className="text-button">Manage account</button></div></div></div>;
}

function NewNoteModal({ onClose }: { onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">Quick capture</p><h2>New note</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><input className="title-input" placeholder="Give your note a title..." autoFocus /><textarea placeholder="Start writing, or paste something here..." rows={7} /><div className="modal-footer"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onClose}><Sparkles size={16} /> Save note</button></div></div></div>;
}

export default App;
