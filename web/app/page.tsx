"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Archive, ArrowRight, BarChart3, Bell, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Cloud, FileText, FolderOpen, Grid2X2, Home,
  LayoutList, Menu, MessageCircle, MoreHorizontal, PanelLeftClose, PanelLeftOpen,
  Paperclip, PenLine, Plus, Search, Settings, ShieldCheck, Sparkles, Star, Trash2,
  Upload, Zap, Clock3,
} from "lucide-react";

type Route = "overview" | "notes" | "assistant" | "documents" | "favorites" | "archive" | "trash" | "tools" | "quiz" | "flashcards" | "roadmap" | "mindmap" | "planner" | "search" | "settings";
type Note = { id?: number; title: string; course: string; time: string; tag: string; content?: string; pinned?: boolean; favorite?: boolean; archived?: boolean; deleted?: boolean; state?: "active" | "archived" | "deleted" };
const NOTES: Note[] = [];

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://study-sphere-ai-mwlq.vercel.app").replace(/\\/+$/, "");

async function workspaceToken(): Promise<string> {
  if (typeof window === "undefined") throw new Error("Workspace requests require a browser.");
  const saved = window.localStorage.getItem("ss_token");
  if (saved) return saved;
  const response = await fetch(API_BASE + "/api/auth/guest", { method: "POST" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) throw new Error(payload.detail || "Could not start a workspace session.");
  window.localStorage.setItem("ss_token", payload.token);
  if (payload.user) window.localStorage.setItem("ss_user", JSON.stringify(payload.user));
  return payload.token as string;
}

async function apiRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await workspaceToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", "Bearer " + token);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(API_BASE + path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload && (payload.detail || payload.message);
    throw new Error(typeof detail === "string" ? detail : "Request failed (" + response.status + ").");
  }
  return payload as T;
}

function normalizeNote(raw: any): Note {
  const date = raw.created_at ? new Date(raw.created_at) : null;
  return {
    id: Number(raw.id), title: String(raw.topic || "Untitled note"), course: "My workspace",
    time: date && !Number.isNaN(date.getTime()) ? "Created " + date.toLocaleDateString() : "Saved note",
    tag: raw.pinned ? "Pinned" : raw.favorite ? "Favorite" : "Note", content: String(raw.content || ""),
    pinned: Boolean(raw.pinned), favorite: Boolean(raw.favorite), archived: Boolean(raw.archived),
    deleted: Boolean(raw.deleted), state: raw.deleted ? "deleted" : raw.archived ? "archived" : "active",
  };
}
const tools = [
  ["quiz", "Quiz Generator", "Turn notes into a focused practice set.", CircleHelp],
  ["flashcards", "Flashcards", "Recall what matters before the next lecture.", BookOpen],
  ["roadmap", "Study Roadmap", "Make a clear path from goal to mastery.", Zap],
  ["mindmap", "Mind Maps", "See the connections between your ideas.", BarChart3],
  ["planner", "Revision Planner", "Give every deadline a calm place.", CalendarDays],
] as const;
function routeFromPath(path: string): Route { const key = path.replace(/^\/+/, "").replace(/^app\/?/, "") || "overview"; const allowed = ["overview","notes","assistant","documents","favorites","archive","trash","tools","quiz","flashcards","roadmap","mindmap","planner","search","settings"]; return allowed.includes(key) ? key as Route : "overview"; }
function pathFor(route: Route) { return route === "overview" ? "/" : "/#/" + route; }
function AppLogo({ compact = false }: { compact?: boolean }) { return <div className="app-logo"><img src={compact ? "/logo-symbol.svg" : "/logo-wordmark.svg"} alt="Notely" /></div>; }

function Sidebar({ route, setRoute, collapsed, setCollapsed, mobileOpen, setMobileOpen }: { route: Route; setRoute: (r: Route) => void; collapsed: boolean; setCollapsed: (v: boolean) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const go = (r: Route) => { setRoute(r); setMobileOpen(false); };
  const primary = [["overview", "Overview", Home], ["notes", "My Notes", FileText], ["assistant", "AI Assistant", Sparkles], ["documents", "Documents", FolderOpen]] as const;
  const library = [["favorites", "Favorites", Star], ["archive", "Archive", Archive], ["trash", "Trash", Trash2]] as const;
  return <><div className={`sidebar-scrim ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} /><aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
    <div className="sidebar-top"><AppLogo compact={collapsed} /> {!collapsed && <div className="brand-copy"><strong>Notely</strong><span>My workspace</span></div>}<button className="icon-button collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button></div>
    <button className="new-note" onClick={() => go("notes")}><PenLine /><span>New note</span><kbd>⌘ N</kbd></button>
    <button className="sidebar-search" onClick={() => go("search")}><Search /><span>Search anything</span><kbd>⌘ K</kbd></button>
    <nav className="side-nav" aria-label="Workspace navigation"><span className="nav-label">Workspace</span>{primary.map(([id, label, Icon]) => <NavButton key={id} active={route === id} icon={<Icon />} label={label} collapsed={collapsed} onClick={() => go(id)} />)}<span className="nav-label">Library</span>{library.map(([id, label, Icon]) => <NavButton key={id} active={route === id} icon={<Icon />} label={label} collapsed={collapsed} onClick={() => go(id)} />)}<span className="nav-label">Study tools</span><NavButton active={route === "tools" || ["quiz","flashcards","roadmap","mindmap","planner"].includes(route)} icon={<Zap />} label="Tools hub" collapsed={collapsed} onClick={() => go("tools")} badge="5" /><NavButton active={route === "settings"} icon={<Settings />} label="Settings" collapsed={collapsed} onClick={() => go("settings")} /></nav>
    <div className="sidebar-bottom">{!collapsed && <div className="sync-card"><div><Cloud /><span>Cloud sync on</span></div><small>All changes saved</small></div>}<button className="profile-card" onClick={() => go("settings")}><span className="avatar">JL</span>{!collapsed && <span><strong>Jamie Lee</strong><small>Student workspace</small></span>}<MoreHorizontal /></button></div>
  </aside></>;
}
function NavButton({ active, icon, label, collapsed, onClick, badge }: { active: boolean; icon: ReactNode; label: string; collapsed: boolean; onClick: () => void; badge?: string }) { return <button className={`nav-button ${active ? "active" : ""} ${collapsed ? "icon-only" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined}><span>{icon}</span>{!collapsed && <><strong>{label}</strong>{badge && <small>{badge}</small>}</>}</button>; }
function Header({ title, subtitle, setRoute, onMenu }: { title: string; subtitle?: string; setRoute: (r: Route) => void; onMenu: () => void }) { return <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight /><strong>{title}</strong>{subtitle && <><ChevronRight /><span>{subtitle}</span></>}</div><div className="topbar-actions"><button className="top-search" onClick={() => setRoute("search")}><Search /><span>Search</span><kbd>⌘ K</kbd></button><button className="notification icon-button" aria-label="Notifications"><Bell /><i /></button><button className="top-avatar" onClick={() => setRoute("settings")}>JL</button></div></header>; }
function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) { return <div className="page-title">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<div className="title-row"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div></div>; }
function ActionButton({ children, secondary = false, onClick }: { children: ReactNode; secondary?: boolean; onClick?: () => void }) { return <button className={`action-button ${secondary ? "secondary" : ""}`} onClick={onClick}>{children}</button>; }
function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) { return <button className="note-card" onClick={onClick}><div className="note-card-top"><span className="course-dot" /><small>{note.course}</small>{note.pinned && <Star className="star-fill" />}</div><h3>{note.title}</h3><p>{note.time}</p><div className="note-tag">{note.tag}</div></button>; }

function Overview({ setRoute }: { setRoute: (r: Route) => void }) { return <div className="screen overview-screen"><PageTitle eyebrow="FRIDAY, OCTOBER 16" title="Good morning, Jamie" description="A calmer place to pick up where you left off." action={<div className="title-actions"><ActionButton secondary onClick={() => setRoute("documents")}><Upload /> Import</ActionButton><ActionButton onClick={() => setRoute("notes")}><Plus /> New note</ActionButton></div>} /><section className="hero-grid"><div className="continue-panel"><div className="panel-kicker"><span className="sparkle-dot"><Sparkles /></span><span>CONTINUE WHERE YOU LEFT OFF</span><span className="saved-status"><CheckCircle2 /> Saved</span></div><h2>Cellular respiration</h2><p>Pick up your Biology 101 note before today&apos;s study group. Your last section was <strong>Why the proton gradient matters</strong>.</p><div className="continue-meta"><span>Biology 101</span><span>8 note pages</span><span>Last opened 18 min ago</span></div><ActionButton onClick={() => setRoute("notes")}><PenLine /> Continue writing <ArrowRight /></ActionButton></div><div className="focus-panel"><div className="panel-kicker"><Clock3 /> TODAY&apos;S FOCUS</div><div className="focus-time">20 <small>/ 30 min</small></div><div className="progress"><i style={{ width: "67%" }} /></div><p>10 minutes left to hit your study goal.</p><button onClick={() => setRoute("planner")}>Open revision planner <ArrowRight /></button></div></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">YOUR SPACE</span><h2>Recent notes</h2></div><button onClick={() => setRoute("notes")}>View all <ArrowRight /></button></div><div className="note-grid">{NOTES.slice(0, 3).map(note => <NoteCard key={note.title} note={note} onClick={() => setRoute("notes")} />)}</div></section><section className="dashboard-grid"><div className="surface-panel"><div className="section-heading"><div><span className="eyebrow">STUDY TOOLS</span><h2>Make it stick</h2></div><button onClick={() => setRoute("tools")}>See all <ArrowRight /></button></div><div className="tool-list">{tools.slice(0, 3).map(([id, label, copy, Icon]) => <button key={id} onClick={() => setRoute(id)}><span className="tool-icon"><Icon /></span><span><strong>{label}</strong><small>{copy}</small></span><ChevronRight /></button>)}</div></div><div className="surface-panel upcoming"><div className="section-heading"><div><span className="eyebrow">UP NEXT</span><h2>Revision plan</h2></div><CalendarDays /></div><div className="upcoming-item"><span className="date-box"><b>17</b><small>OCT</small></span><span><strong>Lab report: yeast respiration</strong><small>Biology 101 · Due tomorrow</small></span><MoreHorizontal /></div><div className="upcoming-item"><span className="check-box"><Check /></span><span><strong>Mechanisms problem set</strong><small>Organic Chemistry · Due Oct 19</small></span><MoreHorizontal /></div><button className="full-link" onClick={() => setRoute("planner")}>View calendar and tasks <ArrowRight /></button></div></section></div>; }

function Notes({ setRoute, filter = "all" }: { setRoute: (r: Route) => void; filter?: "all" | "favorites" | "archive" | "trash" }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const version = useRef(0);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ notes: any[] }>("/api/tools/notes");
      setNotes((data.notes || []).map(normalizeNote));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load notes."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);

  useEffect(() => {
    if (!dirty || selectedId === null) return;
    const editVersion = version.current;
    const timer = window.setTimeout(async () => {
      setSaving(true);
      try {
        await apiRequest("/api/notes/" + selectedId, { method: "PUT", body: JSON.stringify({ topic: title.trim() || "Untitled note", content: body }) });
        if (editVersion === version.current) { setDirty(false); setError(""); }
      } catch (e) { setError(e instanceof Error ? e.message : "Autosave failed."); }
      finally { setSaving(false); }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [selectedId, title, body, dirty]);

  const choose = (note: Note) => {
    setSelectedId(note.id || null); setTitle(note.title); setBody(note.content || "");
    setDirty(false); setError("");
  };
  const create = async () => {
    try {
      const data = await apiRequest<{ note: any }>("/api/notes", { method: "POST", body: JSON.stringify({ topic: "Untitled note", content: "" }) });
      const note = normalizeNote(data.note);
      setNotes(current => [note, ...current]); choose(note);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create a note."); }
  };
  const flag = async (note: Note, patch: Record<string, boolean>) => {
    if (!note.id) return;
    try {
      await apiRequest("/api/tools/notes/" + note.id, { method: "PATCH", body: JSON.stringify(patch) });
      setNotes(current => current.map(n => n.id === note.id ? { ...n, ...patch, state: patch.deleted ? "deleted" : patch.archived ? "archived" : "active" } : n));
      if (selectedId === note.id && (patch.deleted || patch.archived)) setSelectedId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update note."); }
  };
  const remove = async (note: Note) => {
    if (!note.id) return;
    try { await apiRequest("/api/tools/notes/" + note.id, { method: "DELETE" }); setNotes(current => current.filter(n => n.id !== note.id)); if (selectedId === note.id) setSelectedId(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete note."); }
  };
  const visible = notes.filter(n => filter === "favorites" ? n.favorite : filter === "archive" ? n.archived && !n.deleted : filter === "trash" ? n.deleted : !n.archived && !n.deleted).filter(n => (n.title + " " + (n.content || "")).toLowerCase().includes(query.toLowerCase()));
  const selected = notes.find(n => n.id === selectedId);
  const heading = filter === "favorites" ? "Favorites" : filter === "archive" ? "Archive" : filter === "trash" ? "Trash" : "My notes";

  return <div className="screen">
    <PageTitle eyebrow="YOUR KNOWLEDGE" title={heading} description="Create, edit and organize your notes. Edits autosave to your workspace." action={<ActionButton onClick={create}><Plus /> New note</ActionButton>} />
    <div className="toolbar"><label className="inline-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes and content" /></label></div>
    {error && <div role="alert" className="surface-panel" style={{ marginBottom: 16, color: "#bd5f62" }}>{error}</div>}
    {loading ? <div className="surface-panel">Loading notes…</div> : visible.length ? <div className="note-grid">{visible.map(note => <div key={note.id} className="note-entry">
      <NoteCard note={note} onClick={() => choose(note)} />
      <div className="note-entry-actions">
        <button onClick={() => void flag(note, { favorite: !note.favorite })}>{note.favorite ? "★ Favorite" : "☆ Favorite"}</button>
        {filter === "trash" ? <><button onClick={() => void flag(note, { deleted: false, archived: false })}>Restore</button><button onClick={() => void remove(note)}>Delete permanently</button></> : <><button onClick={() => void flag(note, { archived: !note.archived })}>{note.archived ? "Unarchive" : "Archive"}</button><button onClick={() => void flag(note, { deleted: true, archived: false })}>Move to trash</button></>}
      </div>
    </div>)}</div> : <EmptyState icon={<FileText />} title={heading === "Trash" ? "Trash is empty" : heading === "Archive" ? "No archived notes" : heading === "Favorites" ? "No favorites yet" : "No notes yet"} copy="Your notes will appear here when you create or generate them." action={filter === "all" ? <ActionButton onClick={create}><Plus /> Create a note</ActionButton> : undefined} />}
    {selected && <section className="surface-panel" style={{ marginTop: 20 }}>
      <div className="section-heading"><div><span className="eyebrow">NOTE EDITOR</span><h2>{title || "Untitled note"}</h2></div><span role="status">{saving ? "Saving…" : dirty ? "Unsaved changes" : "Saved"}</span></div>
      <label style={{ display: "grid", gap: 8, marginBottom: 14 }}>Title<input value={title} maxLength={200} onChange={e => { version.current++; setTitle(e.target.value); setDirty(true); }} /></label>
      <label style={{ display: "grid", gap: 8 }}>Content<textarea value={body} rows={12} placeholder="Start writing…" onChange={e => { version.current++; setBody(e.target.value); setDirty(true); }} /></label>
      <div className="title-actions" style={{ marginTop: 14 }}><ActionButton secondary onClick={() => setRoute("assistant")}><Sparkles /> Ask AI</ActionButton><ActionButton onClick={() => setSelectedId(null)}>Close editor</ActionButton></div>
    </section>}
  </div>;
}

function Assistant({ setRoute }: { setRoute: (r: Route) => void }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ chats: any[] }>("/api/chats");
        const latest = (data.chats || [])[0];
        if (!latest || cancelled) return;
        const detail = await apiRequest<{ messages: any[] }>("/api/chats/" + latest.id);
        if (cancelled) return;
        setChatId(Number(latest.id));
        setMessages((detail.messages || []).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") })));
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "Could not load chat history."); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  const send = async (value = prompt) => {
    const question = value.trim();
    if (!question || loading) return;
    setPrompt(""); setError(""); setLoading(true);
    setMessages(current => [...current, { role: "user", content: question }, { role: "assistant", content: "" }]);
    try {
      let id = chatId;
      if (!id) {
        const created = await apiRequest<{ chat: { id: number } }>("/api/chats", { method: "POST", body: JSON.stringify({ title: question.slice(0, 60) }) });
        id = Number(created.chat.id); setChatId(id);
      }
      const token = await workspaceToken();
      const response = await fetch(API_BASE + "/api/chats/" + id + "/stream", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ content: question, model: "auto" }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "AI request failed (" + response.status + ").");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";
        for (const frame of frames) {
          const line = frame.split("\n").find(row => row.startsWith("data:"));
          if (!line) continue;
          let event: any;
          try { event = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (event.event === "token") {
            answer += String(event.token || "");
            setMessages(current => current.map((m, index) => index === current.length - 1 ? { ...m, content: answer } : m));
          } else if (event.event === "error") {
            throw new Error(event.error?.message || "AI response failed. Please try again.");
          } else if (event.event === "done") done = true;
        }
      }
      if (!answer.trim()) {
        const detail = await apiRequest<{ messages: any[] }>("/api/chats/" + id);
        const last = (detail.messages || []).filter(m => m.role === "assistant").slice(-1)[0];
        if (last) setMessages(current => current.map((m, index) => index === current.length - 1 ? { ...m, content: String(last.content || "") } : m));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setMessages(current => current.map((m, index) => index === current.length - 1 && m.role === "assistant" && !m.content ? { ...m, content: "I couldn't complete that response. Please try again." } : m));
    } finally { setLoading(false); }
  };

  return <div className="screen assistant-screen">
    <PageTitle eyebrow="AI STUDY PARTNER" title="Ask Notely" description="Chat with your configured AI provider. Your conversation is saved to your workspace." action={<ActionButton secondary onClick={() => setRoute("notes")}><FileText /> Open notes</ActionButton>} />
    <div className="assistant-layout">
      <div className="chat-panel">
        <div className="context-strip"><span><Sparkles /> NOTELY AI</span><span><Cloud /> Saved chat history</span></div>
        <div className="chat-scroll">
          {!messages.length && <div className="empty-tool-state"><Sparkles /><h2>What are you studying today?</h2><p>Ask for an explanation, summary, quiz, or step-by-step help.</p><div className="suggestion-row"><button onClick={() => setPrompt("Explain a difficult topic in simple words")}>Explain simply</button><button onClick={() => setPrompt("Quiz me on my current topic")}>Quiz me</button><button onClick={() => setPrompt("Summarize the key points")}>Summarize</button></div></div>}
          {messages.map((message, index) => <div key={index} className={message.role === "user" ? "user-message" : "ai-message"}><div className="ai-label">{message.role === "assistant" ? <><span className="ai-mark"><Sparkles /></span> NOTELY</> : "YOU"}</div><p style={{ whiteSpace: "pre-wrap" }}>{message.content || (loading && index === messages.length - 1 ? "Thinking…" : "")}</p></div>)}
          <div ref={bottomRef} />
        </div>
        {error && <div role="alert" style={{ padding: "8px 16px", color: "#bd5f62" }}>{error}</div>}
        <div className="composer"><div className="composer-box"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Ask Notely anything…" rows={2} /><div><button className="send-button" disabled={loading || !prompt.trim()} onClick={() => void send()} aria-label="Send message">{loading ? <Clock3 /> : <ArrowRight />}</button></div></div><small>Enter to send · Shift+Enter for a new line</small></div>
      </div>
      <aside className="source-panel"><div className="section-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Quick actions</h2></div><Sparkles /></div><button className="source-card" onClick={() => setRoute("notes")}><FileText /><span><strong>My notes</strong><small>Create and edit notes</small></span><ArrowRight /></button><button className="source-card" onClick={() => setRoute("documents")}><FolderOpen /><span><strong>Documents</strong><small>Upload and summarize files</small></span><ArrowRight /></button><button className="source-card" onClick={() => setRoute("tools")}><Zap /><span><strong>Study tools</strong><small>Generate practice material</small></span><ArrowRight /></button></aside>
    </div>
  </div>;
}

function Documents({ setRoute }: { setRoute: (r: Route) => void }) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filter, setFilter] = useState("All materials");
  const browse = () => document.getElementById("notely-document-input")?.click();
  return <div className="screen"><PageTitle eyebrow="YOUR MATERIALS" title="Documents" description="Readings, slides and references close to your notes." action={<ActionButton onClick={browse}><Upload /> Import document</ActionButton>} /><input id="notely-document-input" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple hidden onChange={e => { const files = Array.from(e.target.files || []).map(f => f.name); setSelectedFiles(current => [...current, ...files.filter(name => !current.includes(name))]); e.target.value = ""; }} /><div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).map(f => f.name); setSelectedFiles(current => [...current, ...files.filter(name => !current.includes(name))]); }}><Upload /><div><strong>Drop files here, or browse your device</strong><p>PDF, DOCX, PPTX and TXT. Selected files stay in this browser until document upload is connected.</p></div><ActionButton secondary onClick={browse}>Browse files</ActionButton></div>{selectedFiles.length > 0 && <div className="surface-panel"><div className="section-heading"><div><span className="eyebrow">LOCAL SELECTION</span><h2>Files ready to import ({selectedFiles.length})</h2></div><button type="button" onClick={() => setSelectedFiles([])}>Clear</button></div>{selectedFiles.map(name => <div className="source-card" key={name}><FileText /><span><strong>{name}</strong><small>Selected locally · not uploaded</small></span><button type="button" aria-label={`Remove ${name}`} onClick={() => setSelectedFiles(current => current.filter(item => item !== name))}>×</button></div>)}</div>}<div className="toolbar"><div className="filter-pills">{["All materials", "PDFs", "Recently added"].map(item => <button type="button" key={item} className={`pill ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}{item === "All materials" && <small>12</small>}</button>)}</div><button type="button" className="select-button" onClick={() => setRoute("notes")}>Biology 101 <ChevronDown /></button></div><div className="document-grid">{[["Ch. 9 — Cellular respiration", "PDF · 18 pages", "Processed"], ["Lecture 07 — Energy & metabolism", "Transcript · 42 min", "Ready"], ["Yeast respiration — lab guide", "PDF · 6 pages", "Processing"], ["Ch. 10 — Photosynthesis", "PDF · 22 pages", "Ready"]].filter(([title, meta]) => filter !== "PDFs" || meta.startsWith("PDF")).map(([title, meta, status]) => <button className="document-card" key={title} onClick={() => setRoute("assistant")}><div className="doc-icon"><FileText /></div><div><strong>{title}</strong><small>{meta}</small></div><span className={status === "Processing" ? "processing" : "ready"}>{status === "Processing" ? <Clock3 /> : <CheckCircle2 />}{status}</span><MoreHorizontal /></button>)}</div></div>;
}
function Tools({ setRoute }: { setRoute: (r: Route) => void }) { return <div className="screen"><PageTitle eyebrow="LEARN BY DOING" title="Study tools" description="Small tools that turn understanding into momentum." /><div className="tools-grid">{tools.map(([id, label, copy, Icon], index) => <button className="big-tool-card" key={id} onClick={() => setRoute(id)}><span className="big-tool-icon"><Icon /></span><span className="eyebrow">0{index + 1} / STUDY</span><h2>{label}</h2><p>{copy}</p><span className="tool-link">Open tool <ArrowRight /></span></button>)}</div></div>; }
function ToolDetail({ route, setRoute }: { route: Route; setRoute: (r: Route) => void }) { const details: Record<string, [string, string, ReactNode]> = { quiz: ["Quiz generator", "Choose a note, set the challenge, and test what you know.", <CircleHelp />], flashcards: ["Flashcards", "A quick recall session built from your Biology 101 notes.", <BookOpen />], roadmap: ["Study roadmap", "Map the topics, goals and next steps for this semester.", <Zap />], mindmap: ["Mind maps", "Connect concepts visually and expand the ideas worth revisiting.", <BarChart3 />], planner: ["Revision planner", "Give every deadline and study session a clear place.", <CalendarDays />] }; const [title, copy, iconNode] = details[route] || details.quiz; return <div className="screen detail-screen"><button className="back-link" onClick={() => setRoute("tools")}>← Back to study tools</button><div className="detail-hero"><span className="big-tool-icon">{iconNode}</span><span className="eyebrow">STUDY TOOL</span><h1>{title}</h1><p>{copy}</p><ActionButton onClick={() => setRoute(route === "quiz" ? "assistant" : "notes")}><Sparkles /> Start with my notes</ActionButton></div><div className="detail-workspace"><div className="surface-panel"><div className="section-heading"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Build from your workspace</h2></div><CheckCircle2 /></div><div className="form-row"><label>Source notebook<select><option>Biology 101</option><option>Organic Chemistry</option></select></label><label>Focus<select><option>Cellular respiration</option><option>All recent notes</option></select></label></div><div className="empty-tool-state">{iconNode}<p>Choose a source to begin. Your generated study material will stay linked to the original note.</p></div></div><div className="surface-panel tool-side-note"><Sparkles /><h3>Designed for your flow</h3><p>Move from a note to practice without losing context. This workspace keeps the source visible as you study.</p></div></div></div>; }
function SearchScreen({ setRoute }: { setRoute: (r: Route) => void }) { const [q, setQ] = useState(""); return <div className="screen"><PageTitle eyebrow="FIND YOUR THREAD" title="Search" description="Search notes, documents and study tools from one place." /><label className="large-search"><Search /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search anything…" /><kbd>⌘ K</kbd></label><div className="search-results"><span className="eyebrow">{q ? "RESULTS" : "RECENTLY OPENED"}</span>{NOTES.filter(n => !q || `${n.title} ${n.course}`.toLowerCase().includes(q.toLowerCase())).slice(0, 4).map(n => <button className="result-row" key={n.title} onClick={() => setRoute("notes")}><span className="result-icon"><FileText /></span><span><strong>{n.title}</strong><small>{n.course} · {n.time}</small></span><ArrowRight /></button>)}<button className="result-row" onClick={() => setRoute("tools")}><span className="result-icon ai"><Sparkles /></span><span><strong>Study tools</strong><small>Quiz generator, flashcards, roadmap and more</small></span><ArrowRight /></button></div></div>; }
function SettingsScreen() {
  const sections = [["Profile", Home], ["Appearance", Grid2X2], ["Editor preferences", PenLine], ["Security & sessions", ShieldCheck], ["Privacy & data", Cloud], ["AI providers", Sparkles], ["Notifications", Bell]] as const;
  const [section, setSection] = useState("Profile");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ "Appearance preferences": true, "Use across this workspace": false, "Show helpful reminders": true });
  const [displayName, setDisplayName] = useState("Jamie Lee");
  const [email, setEmail] = useState("jamie@example.com");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("notely-workspace-settings");
      if (stored) { const data = JSON.parse(stored); if (data.prefs) setPrefs(data.prefs); if (data.displayName) setDisplayName(data.displayName); if (data.email) setEmail(data.email); }
    } catch { /* Ignore unavailable or malformed local preferences. */ }
  }, []);
  const saveSettings = (nextPrefs = prefs, nextName = displayName, nextEmail = email) => {
    try { localStorage.setItem("notely-workspace-settings", JSON.stringify({ prefs: nextPrefs, displayName: nextName, email: nextEmail })); setSaved(true); window.setTimeout(() => setSaved(false), 2200); }
    catch { setSaved(false); }
  };
  const togglePref = (key: string) => setPrefs(current => { const next = { ...current, [key]: !(current[key] ?? false) }; saveSettings(next); return next; });
  return <div className="screen settings-screen"><PageTitle eyebrow="YOUR WORKSPACE" title="Settings" description="Keep your workspace personal, clear and in sync." /><div className="settings-layout"><aside className="settings-nav">{sections.map(([name, Icon]) => <button type="button" className={section === name ? "active" : ""} key={name} onClick={() => setSection(name)}><Icon />{name}</button>)}<div className="settings-danger"><button type="button" onClick={() => { const blob = new Blob([JSON.stringify({ displayName, email, prefs }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "notely-settings.json"; a.click(); URL.revokeObjectURL(url); }}><Trash2 /> Export settings</button></div></aside><div className="settings-content"><span className="eyebrow">{section.toUpperCase()}</span><h2>{section}</h2>{section === "Profile" ? <><div className="profile-large"><span className="avatar big">{(displayName.trim()[0] || "J").toUpperCase()}</span><div><h3>{displayName || "Your profile"}</h3><p>Student workspace · {email || "No email added"}</p></div><ActionButton secondary onClick={() => editing ? (saveSettings(prefs, displayName, email), setEditing(false)) : setEditing(true)}>{editing ? "Save profile" : "Edit profile"}</ActionButton></div><div className="settings-fields"><label>Display name<input value={displayName} readOnly={!editing} onChange={e => setDisplayName(e.target.value)} /></label><label>Email address<input type="email" value={email} readOnly={!editing} onChange={e => setEmail(e.target.value)} /></label></div>{saved && <p role="status" className="settings-saved">Changes saved on this device.</p>}</> : <div className="preference-list">{[[section + " preferences", "Enable this preference for your workspace."], ["Use across this workspace", "Keep this preference consistent on this device."], ["Show helpful reminders", "Receive prompts when something needs your attention."]].map(([label, description]) => <div key={label}><span><strong>{label}</strong><small>{description}</small></span><button type="button" role="switch" aria-checked={!!prefs[label]} aria-label={label} className={`toggle ${prefs[label] ? "on" : ""}`} onClick={() => togglePref(label)}><i /></button></div>)}{saved && <p role="status" className="settings-saved">Preferences saved on this device.</p>}<p className="settings-note">These preferences are stored locally in this browser. Account-wide sync is not connected yet.</p></div>}</div></div></div>;
}
function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) { return <div className="empty-state"><span>{icon}</span><h2>{title}</h2><p>{copy}</p>{action}</div>; }

export default function Page() {
  const [route, setRouteState] = useState<Route>("overview"); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setRouteState(routeFromPath(window.location.pathname)); const onPop = () => setRouteState(routeFromPath(window.location.pathname)); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  const setRoute = (next: Route) => { window.history.pushState({}, "", pathFor(next)); setRouteState(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => {
    try { setCollapsed(localStorage.getItem("notely-sidebar-collapsed") === "true"); } catch { /* Storage can be unavailable in private contexts. */ }
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
      if (event.key === "Escape") { setMobileOpen(false); return; }
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "k") { event.preventDefault(); setRoute("search"); }
      if (key === "n" && !typing) { event.preventDefault(); setRoute("notes"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    try { localStorage.setItem("notely-sidebar-collapsed", String(collapsed)); } catch { /* Keep the control usable without storage. */ }
  }, [collapsed]);
  const titles: Partial<Record<Route, string>> = { overview: "Overview", notes: "My Notes", assistant: "AI Assistant", documents: "Documents", favorites: "Favorites", archive: "Archive", trash: "Trash", tools: "Study Tools", quiz: "Quiz Generator", flashcards: "Flashcards", roadmap: "Study Roadmap", mindmap: "Mind Maps", planner: "Revision Planner", search: "Search", settings: "Settings" };
  let content: ReactNode = <Overview setRoute={setRoute} />;
  if (route === "notes") content = <Notes setRoute={setRoute} />; else if (["favorites","archive","trash"].includes(route)) content = <Notes setRoute={setRoute} filter={route as "favorites" | "archive" | "trash"} />; else if (route === "assistant") content = <Assistant setRoute={setRoute} />; else if (route === "documents") content = <Documents setRoute={setRoute} />; else if (route === "tools") content = <Tools setRoute={setRoute} />; else if (["quiz","flashcards","roadmap","mindmap","planner"].includes(route)) content = <ToolDetail route={route} setRoute={setRoute} />; else if (route === "search") content = <SearchScreen setRoute={setRoute} />; else if (route === "settings") content = <SettingsScreen />;
  return <div className="workspace"><Sidebar route={route} setRoute={setRoute} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><main className="workspace-main"><Header title={titles[route] || "Workspace"} setRoute={setRoute} onMenu={() => setMobileOpen(true)} />{content}</main></div>;
}
