"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Archive,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Command,
  FileText,
  GitBranch,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Tags,
  X,
  Zap,
} from "lucide-react";

type View = "overview" | "chats" | "notes" | "topics" | "roadmaps" | "mindmaps" | "settings";
type Icon = ComponentType<{ className?: string }>;

const navItems: { id: View; label: string; icon: Icon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "chats", label: "Chats", icon: MessageCircle },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "topics", label: "Topics", icon: Tags },
  { id: "roadmaps", label: "Roadmaps", icon: GitBranch },
  { id: "mindmaps", label: "Mindmaps", icon: BrainCircuit },
];

const notes = [
  { title: "Understanding retrieval augmented generation", type: "AI Systems", date: "Today", color: "blue" },
  { title: "Q4 planning notes", type: "Planning", date: "Yesterday", color: "amber" },
  { title: "Ideas for the reading list", type: "Personal", date: "Sep 21", color: "violet" },
  { title: "The economics of attention", type: "Research", date: "Sep 18", color: "emerald" },
];

const chats = [
  { title: "Help me understand vector databases", preview: "Here is a mental model for how embeddings...", time: "12 min ago" },
  { title: "Plan a two-week learning sprint", preview: "I would structure the sprint around three...", time: "Yesterday" },
  { title: "Summarize my notes on focus", preview: "The strongest recurring idea is to protect...", time: "Sep 20" },
];

function Sidebar({ view, setView, collapsed, setCollapsed, mobileOpen, setMobileOpen }: { view: View; setView: (v: View) => void; collapsed: boolean; setCollapsed: (v: boolean) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`workspace-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-5">
            <button className="brand-lockup" onClick={() => { setView("overview"); setMobileOpen(false); }} aria-label="Go to overview">
              <span className="brand-mark"><Sparkles className="h-4 w-4" /></span>
              <span className="brand-name">AI Notebook</span>
            </button>
            <button className="icon-button sidebar-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <div className="px-3">
            <button className="new-chat-button" onClick={() => { setView("chats"); setMobileOpen(false); }}><Plus className="h-4 w-4" /><span>New chat</span><kbd>⌘ N</kbd></button>
          </div>

          <nav className="mt-7 flex-1 px-3" aria-label="Workspace navigation">
            <p className="sidebar-label">Workspace</p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} className={`nav-link ${view === item.id ? "active" : ""}`} onClick={() => { setView(item.id); setMobileOpen(false); }} title={collapsed ? item.label : undefined}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span>{item.id === "chats" && !collapsed && <span className="nav-count">3</span>}</button>;
              })}
            </div>
            <div className="my-6 border-t border-line" />
            <p className="sidebar-label">Your library</p>
            <button className="nav-link" onClick={() => { setView("notes"); setMobileOpen(false); }}><Archive className="h-[18px] w-[18px]" /><span>Saved items</span></button>
          </nav>

          <div className="border-t border-line p-3">
            <button className={`nav-link ${view === "settings" ? "active" : ""}`} onClick={() => { setView("settings"); setMobileOpen(false); }}><Settings className="h-[18px] w-[18px]" /><span>Settings</span></button>
            <button className="profile-row" onClick={() => setView("settings")}><span className="avatar">JD</span><span className="min-w-0 text-left"><strong className="block truncate text-sm text-ink">Jack Daniels</strong><small className="block text-xs text-ink-faint">AI Notebook Pro</small></span><MoreHorizontal className="ml-auto h-4 w-4 text-ink-faint" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ view, onSearch, onMenu }: { view: View; onSearch: () => void; onMenu: () => void }) {
  const label = navItems.find((item) => item.id === view)?.label ?? "Overview";
  return <header className="workspace-header"><div className="flex min-w-0 items-center gap-3"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><div><p className="eyebrow">Workspace / {view === "overview" ? "Today" : label}</p><h1 className="page-title">{label}</h1></div></div><div className="header-actions"><button className="search-trigger" onClick={onSearch}><Search className="h-4 w-4" /><span>Search your workspace</span><kbd>⌘ K</kbd></button><button className="icon-button"><Sun className="h-4 w-4" /></button><button className="avatar avatar-small">JD</button></div></header>;
}

function Overview({ setView }: { setView: (v: View) => void }) {
  return <div className="page-content">
    <section className="welcome-row"><div><p className="eyebrow accent-text">Thursday, September 24, 2026</p><h2 className="hero-title">Good afternoon, Jack<span className="accent-text">.</span></h2><p className="hero-subtitle">Pick up a thread or make space for a new idea.</p></div><button className="primary-button" onClick={() => setView("chats")}><Plus className="h-4 w-4" /> Start a chat</button></section>
    <section className="continue-panel"><div className="continue-copy"><span className="section-kicker">CONTINUE WHERE YOU LEFT OFF</span><h3>Understanding retrieval augmented generation</h3><p>Chat · Updated 12 minutes ago</p><button className="text-button" onClick={() => setView("chats")}>Open conversation <ArrowUpRight className="h-4 w-4" /></button></div><div className="continue-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><Sparkles className="h-8 w-8 text-accent" /></div></section>
    <div className="section-heading"><div><span className="section-kicker">YOUR WORKSPACE</span><h3>Make progress across your knowledge</h3></div><button className="text-button" onClick={() => setView("notes")}>View all <ChevronRight className="h-4 w-4" /></button></div>
    <div className="overview-grid"><button className="metric-line" onClick={() => setView("notes")}><span className="metric-icon blue"><FileText className="h-5 w-5" /></span><span><strong>24</strong><small>Notes in your library</small></span><ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint" /></button><button className="metric-line" onClick={() => setView("topics")}><span className="metric-icon violet"><BookOpen className="h-5 w-5" /></span><span><strong>8</strong><small>Active knowledge hubs</small></span><ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint" /></button><button className="metric-line" onClick={() => setView("roadmaps")}><span className="metric-icon amber"><Zap className="h-5 w-5" /></span><span><strong>3</strong><small>Learning paths underway</small></span><ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint" /></button></div>
    <div className="content-columns"><section><div className="section-heading compact"><div><span className="section-kicker">RECENT NOTES</span><h3>Ideas worth returning to</h3></div><button className="text-button" onClick={() => setView("notes")}>See notes <ChevronRight className="h-4 w-4" /></button></div><div className="note-list">{notes.slice(0, 3).map((note) => <button className="note-row" key={note.title} onClick={() => setView("notes")}><span className={`note-dot ${note.color}`} /><span className="min-w-0 flex-1 text-left"><strong className="block truncate">{note.title}</strong><small>{note.type} · {note.date}</small></span><ChevronRight className="h-4 w-4 text-ink-faint" /></button>)}</div></section><section><div className="section-heading compact"><div><span className="section-kicker">QUICK ACTIONS</span><h3>What do you want to do?</h3></div></div><div className="quick-actions"><button onClick={() => setView("chats")}><MessageCircle className="h-4 w-4 text-accent" /><span>Ask AI Notebook</span><ChevronRight className="ml-auto h-4 w-4" /></button><button onClick={() => setView("notes")}><FileText className="h-4 w-4 text-amber-300" /><span>Capture a note</span><ChevronRight className="ml-auto h-4 w-4" /></button><button onClick={() => setView("topics")}><Tags className="h-4 w-4 text-violet-300" /><span>Explore a topic</span><ChevronRight className="ml-auto h-4 w-4" /></button></div></section></div>
  </div>;
}

function Chats() {
  const [draft, setDraft] = useState("");
  return <div className="page-content chat-page"><div className="chat-intro"><div><span className="section-kicker">AI NOTEBOOK / CONVERSATION</span><h2 className="hero-title small">A thinking partner for your notes.</h2><p className="hero-subtitle">Ask a question, explore an idea, or turn a rough thought into something useful.</p></div><button className="secondary-button"><Archive className="h-4 w-4" /> History</button></div><div className="conversation"><div className="message ai-message"><span className="message-avatar"><Sparkles className="h-4 w-4" /></span><div><p className="message-meta">AI NOTEBOOK <span>• Just now</span></p><p className="message-copy">Welcome back. I can help you connect the ideas in your workspace, or we can start with a blank page.</p><div className="suggestion-row"><button onClick={() => setDraft("Help me organize my recent notes")}>Organize my recent notes <ArrowUpRight className="h-3.5 w-3.5" /></button><button onClick={() => setDraft("Create a learning plan for me")}>Create a learning plan <ArrowUpRight className="h-3.5 w-3.5" /></button></div></div></div></div><div className="composer"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask anything about your workspace..." rows={2} /><div className="composer-footer"><span className="text-xs text-ink-faint">AI Notebook Pro · <kbd>⌘ ↵</kbd> to send</span><button className="send-button" aria-label="Send message"><Send className="h-4 w-4" /></button></div></div><div className="recent-chat-list"><div className="section-heading compact"><div><span className="section-kicker">RECENT CONVERSATIONS</span><h3>Continue a thread</h3></div></div>{chats.map((chat) => <button className="chat-row" key={chat.title}><span className="chat-row-icon"><MessageCircle className="h-4 w-4" /></span><span className="min-w-0 flex-1 text-left"><strong className="block truncate">{chat.title}</strong><small className="block truncate">{chat.preview}</small></span><small className="shrink-0">{chat.time}</small><ChevronRight className="h-4 w-4 text-ink-faint" /></button>)}</div></div>;
}

function Notes() { const [selected, setSelected] = useState(notes[0]); return <div className="page-content"><div className="section-toolbar"><div><p className="hero-subtitle">A calm place for everything you want to remember.</p></div><button className="primary-button"><Plus className="h-4 w-4" /> New note</button></div><div className="notes-workspace"><div className="notes-index"><div className="inline-search"><Search className="h-4 w-4" /><input placeholder="Filter notes" /></div><div className="notes-filter"><span>ALL NOTES <b>24</b></span><span>Pinned <b>4</b></span></div>{notes.map((note) => <button className={`index-note ${selected.title === note.title ? "selected" : ""}`} key={note.title} onClick={() => setSelected(note)}><span className={`note-dot ${note.color}`} /><span className="min-w-0 text-left"><strong className="block truncate">{note.title}</strong><small>{note.type} · {note.date}</small></span></button>)}</div><article className="note-editor"><div className="editor-meta"><span className="note-dot blue" /> {selected.type}<button className="icon-button ml-auto"><MoreHorizontal className="h-4 w-4" /></button></div><h2>{selected.title}</h2><p className="editor-date">Last edited {selected.date.toLowerCase()}</p><div className="editor-rule" /><p>Ideas become useful when they have somewhere to land. This note is a working space for connecting the important details, questions, and next steps around <strong>{selected.type.toLowerCase()}</strong>.</p><h3>Key takeaways</h3><ul><li>Keep the central idea visible and easy to return to.</li><li>Link new observations to the context that made them meaningful.</li><li>Leave a clear next action for future you.</li></ul></article></div></div>; }

function Topics() { return <div className="page-content"><div className="section-toolbar"><p className="hero-subtitle">Knowledge hubs that give your ideas a home.</p><button className="primary-button"><Plus className="h-4 w-4" /> New topic</button></div><div className="topic-layout"><section className="topic-hero"><span className="topic-symbol">AI</span><div><span className="section-kicker">FEATURED TOPIC</span><h2>AI Systems</h2><p>How modern AI products work, from retrieval to reasoning.</p></div><div className="topic-progress"><strong>68%</strong><small>explored</small><div className="progress-track"><i style={{ width: "68%" }} /></div></div></section><div className="topic-section-heading"><span>YOUR TOPICS</span><small>8 active hubs</small></div><div className="topic-grid">{["AI Systems", "Personal growth", "Product strategy", "Reading list", "Creative practice", "Work notes"].map((topic, i) => <button className="topic-card" key={topic}><span className={`topic-card-icon t${i % 4}`}>{["AI", "PG", "PS", "RL", "CP", "WN"][i]}</span><strong>{topic}</strong><small>{[14, 9, 7, 12, 6, 21][i]} notes · {i + 2} chats</small><ChevronRight className="ml-auto h-4 w-4 text-ink-faint" /></button>)}</div></div></div>; }

function Roadmaps() { const stages = [{ label: "Foundations", done: true, note: "Core concepts and vocabulary" }, { label: "Build a mental model", done: true, note: "Connect the moving pieces" }, { label: "Apply the ideas", current: true, note: "Use the knowledge in a real project" }, { label: "Share what you know", note: "Teach it back and refine" }]; return <div className="page-content"><div className="section-toolbar"><div><span className="section-kicker">LEARNING PATH</span><h2 className="hero-title small">Build fluency in AI systems.</h2><p className="hero-subtitle">A focused path with room to wander.</p></div><button className="secondary-button"><MoreHorizontal className="h-4 w-4" /> Manage</button></div><section className="roadmap"><div className="roadmap-top"><div><span className="section-kicker">CURRENT ROADMAP</span><h3>AI Systems, from first principles</h3></div><span className="progress-pill">2 of 4 complete</span></div><div className="timeline">{stages.map((stage, i) => <div className={`timeline-stage ${stage.done ? "done" : ""} ${stage.current ? "current" : ""}`} key={stage.label}><div className="timeline-marker">{stage.done ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}</div><div><h4>{stage.label}{stage.current && <span className="current-label">CURRENT</span>}</h4><p>{stage.note}</p></div></div>)}</div></section></div>; }

function Mindmaps() { return <div className="page-content mindmap-page"><div className="section-toolbar"><div><p className="hero-subtitle">See how your ideas connect.</p></div><div className="map-controls"><button>−</button><span>100%</span><button>+</button><button><span className="sr-only">Reset</span><Circle className="h-3.5 w-3.5" /></button></div></div><div className="mindmap-canvas"><div className="map-line line-a" /><div className="map-line line-b" /><div className="map-line line-c" /><div className="map-node center"><Sparkles className="h-4 w-4" /><strong>AI Systems</strong><small>14 notes</small></div><div className="map-node node-a"><BookOpen className="h-4 w-4" /><strong>Foundations</strong><small>5 notes</small></div><div className="map-node node-b"><BrainCircuit className="h-4 w-4" /><strong>RAG</strong><small>4 notes</small></div><div className="map-node node-c"><Zap className="h-4 w-4" /><strong>Applications</strong><small>5 notes</small></div><div className="canvas-hint">Drag to pan · Scroll to zoom</div></div></div>; }

function SettingsView({ theme, setTheme, accent, setAccent, collapsed, setCollapsed }: { theme: string; setTheme: (v: string) => void; accent: string; setAccent: (v: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) { return <div className="page-content settings-page"><p className="hero-subtitle">Make the workspace feel like yours.</p><div className="settings-layout"><nav className="settings-nav"><span className="active">Appearance</span><span>General</span><span>Chat</span><span>Accessibility</span><span>Account</span></nav><div className="settings-content"><section className="settings-section"><span className="section-kicker">APPEARANCE</span><h2>Shape your workspace</h2><p>Changes are saved automatically on this device.</p><label className="setting-label">Theme<div className="segmented">{["dark", "light", "system"].map((item) => <button className={theme === item ? "selected" : ""} key={item} onClick={() => setTheme(item)}>{item === "dark" ? <Moon className="h-4 w-4" /> : item === "light" ? <Sun className="h-4 w-4" /> : <Circle className="h-4 w-4" />}{item[0].toUpperCase() + item.slice(1)}</button>)}</div></label><label className="setting-label">Accent color<div className="accent-picker">{["#8b7cff", "#4f8cff", "#2abfa4", "#e9a23b", "#ed719d"].map((color) => <button key={color} aria-label={`Use ${color} accent`} className={accent === color ? "selected" : ""} style={{ background: color }} onClick={() => setAccent(color)}>{accent === color && <Check className="h-3 w-3 text-white" />}</button>)}</div></label><div className="setting-toggle"><span><strong>Compact sidebar</strong><small>Keep navigation focused while you work.</small></span><button className={`toggle ${collapsed ? "on" : ""}`} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle compact sidebar"><i /></button></div><div className="preview-card"><div className="preview-top"><span className="brand-mark"><Sparkles className="h-3 w-3" /></span><span>AI Notebook</span><span className="ml-auto preview-dot" /></div><div className="preview-body"><span className="preview-message" /><span className="preview-message short" /><span className="preview-input" /></div></div></section></div></div></div>; }

export default function Page() {
  const [view, setView] = useState<View>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("#8b7cff");
  useEffect(() => { const saved = window.localStorage.getItem("ai-notebook-preferences"); if (saved) { const prefs = JSON.parse(saved); setCollapsed(Boolean(prefs.collapsed)); setTheme(prefs.theme || "dark"); setAccent(prefs.accent || "#8b7cff"); } }, []);
  useEffect(() => { window.localStorage.setItem("ai-notebook-preferences", JSON.stringify({ collapsed, theme, accent })); document.documentElement.style.setProperty("--accent", accent); }, [collapsed, theme, accent]);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); } if (event.key === "Escape") setCommandOpen(false); }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);
  const page = useMemo(() => { if (view === "overview") return <Overview setView={setView} />; if (view === "chats") return <Chats />; if (view === "notes") return <Notes />; if (view === "topics") return <Topics />; if (view === "roadmaps") return <Roadmaps />; if (view === "mindmaps") return <Mindmaps />; return <SettingsView theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} collapsed={collapsed} setCollapsed={setCollapsed} />; }, [view, theme, accent, collapsed]);
  return <div className={`app-frame ${theme === "light" ? "light-mode" : ""}`}><Sidebar {...{ view, setView, collapsed, setCollapsed, mobileOpen, setMobileOpen }} /><main className="workspace-main"><Header view={view} onSearch={() => setCommandOpen(true)} onMenu={() => setMobileOpen(true)} />{page}</main>{commandOpen && <div className="command-backdrop" onClick={() => setCommandOpen(false)}><div className="command-modal" onClick={(e) => e.stopPropagation()}><div className="command-input"><Search className="h-5 w-5" /><input autoFocus placeholder="Search notes, chats, topics..." /><kbd>ESC</kbd><button onClick={() => setCommandOpen(false)}><X className="h-4 w-4" /></button></div><div className="command-section"><span>QUICK ACTIONS</span>{[{ icon: Plus, label: "Start a new chat", action: "chats" as View }, { icon: FileText, label: "Open notes", action: "notes" as View }, { icon: Tags, label: "Browse topics", action: "topics" as View }, { icon: Settings, label: "Open settings", action: "settings" as View }].map((item) => { const Icon = item.icon; return <button key={item.label} onClick={() => { setView(item.action); setCommandOpen(false); }}><Icon className="h-4 w-4" /><span>{item.label}</span><ChevronRight className="ml-auto h-4 w-4" /></button>; })}</div><div className="command-footer"><Command className="h-3 w-3" /> Navigate <span>↵</span> Select <span>ESC</span> Close</div></div></div>}</div>;
}
