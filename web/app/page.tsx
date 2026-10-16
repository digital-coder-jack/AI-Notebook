"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Folder,
  Headphones,
  ListChecks,
  Menu,
  MoreHorizontal,
  Paperclip,
  PanelLeft,
  PlayCircle,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  SquarePen,
  Upload,
  X,
} from "lucide-react";

const pages = [
  ["Energy & enzymes", "Lecture 06 · Oct 9"],
  ["Cellular respiration", "Lecture 07 · Oct 14"],
  ["Photosynthesis", "Lecture 08 · Oct 16"],
  ["Lab: yeast respiration", "Lab notes · Oct 15"],
  ["Midterm review", "Study guide · Oct 20"],
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <button aria-label="Close navigation" className={`mobile-scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`left-rail ${open ? "mobile-open" : ""}`}>
        <div className="brand"><span className="brand-icon"><SquarePen /></span><span>Notely</span></div>
        <button className="search-box"><Search /><span>Search anything</span><kbd>⌘ K</kbd></button>
        <nav className="primary-nav" aria-label="Main navigation">
          {([[BookOpen, "Overview"], [FileText, "My notebooks"], [Folder, "Course materials"], [ListChecks, "Flashcards"], [Check, "Quizzes"], [ListChecks, "Tasks"], [BookOpen, "Calendar"], [Headphones, "Recorded lectures"]] as [ComponentType<{ className?: string }>, string][]).map(([icon, label], index) => { const NavIcon = icon as ComponentType<{ className?: string }>; return <button className={index === 1 ? "active" : ""} key={label}><NavIcon /><span>{label}</span>{index > 1 && index < 6 ? <small>{[24, 48, 3, 4][index - 2]}</small> : null}</button>; })}
        </nav>
        <div className="library-title"><span>MY NOTEBOOKS</span><Plus /></div>
        <div className="notebook-list">
          <button className="notebook active"><i className="indigo" />Biology 101<ChevronDown /></button>
          <button className="notebook"><i className="green" />Organic Chemistry</button>
          <button className="notebook"><i className="orange" />World History</button>
        </div>
        <div className="calendar-card"><strong>On your calendar</strong><span>OCT 16</span><div><b /> <p><strong>Biology study group</strong><small>3:00 PM · Library, room 2B</small></p></div><div className="todo"><span />Lab report due tomorrow</div></div>
        <div className="profile"><span className="avatar">JL</span><span><strong>Jamie Lee</strong><small>Student workspace</small></span><MoreHorizontal /></div>
      </aside>
    </>
  );
}

function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [sent, setSent] = useState(false);
  return <aside className="assistant-panel">
    <div className="assistant-header"><div><Sparkles /><strong>Study assistant</strong></div><div><SquarePen /><X /></div></div>
    <div className="grounded"><div><span>GROUNDED IN YOUR COURSE</span><ListChecks /></div><p><b><FileText /> Current note</b><b><Paperclip /> 2 materials</b></p></div>
    <div className="assistant-scroll"><div className="today">TODAY · 10:42 AM</div><div className="question">Why does ATP production stop without oxygen?</div><div className="answer"><strong><Sparkles /> NOTELY</strong><p>Almost! It&apos;s oxidative phosphorylation that stops, not all ATP production. Here&apos;s the chain reaction:</p>{[["The electron chain backs up", "Without O₂ to accept electrons, the electron transport chain cannot keep running."], ["The H⁺ gradient fades", "Proton pumping stops, so ATP synthase loses the gradient that powers it."], ["Glycolysis can still make ATP", "Fermentation regenerates NAD⁺, allowing glycolysis to yield 2 ATP per glucose."]].map(([title, copy], index) => <div className="answer-step" key={title}><span>{index + 1}</span><p><strong>{title}</strong><small>{copy}</small></p></div>)}</div><div className="source-row"><span><FileText /> 1 Ch. 9, p. 7</span><span><Headphones /> 2 Lecture 12:34</span></div><button className="insert-button"><ArrowLeft /> Insert into note</button><div className="stick-card"><div><LayersIcon /><strong>Make it stick</strong><small>8 cards</small></div><p>Turn this note into a quick recall session before your study group.</p><blockquote>What is the final electron acceptor in cellular respiration?</blockquote><button>Generate flashcards <ArrowRight /></button></div></div>
    <div className="assistant-footer"><div><button>Quiz me on this</button><button>Explain simply</button></div><div className="prompt-box"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask about your notes or materials..." rows={2} /><div><Paperclip /><button aria-label="Send" onClick={() => setSent(true)}><Send /></button></div></div>{sent && <small className="sent-note">Question queued for your study assistant.</small>}<p>A study partner, not a shortcut. Always check your sources.</p></div>
  </aside>;
}
function LayersIcon() { return <BookOpen />; }

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  return <div className="notely-app"><Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} /><main className="notebook-main"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu /></button><div className="crumb"><PanelLeft /><span>My notebooks</span><ChevronRight /><strong>Biology 101</strong></div><div className="top-actions"><span className="saved">⌁ All changes saved</span><button className="icon-only"><Upload /></button><button className="share"><Share2 /> Share</button><button className="study"><Sparkles /> Study assistant</button></div></header><section className="course-head"><div className="course-title"><span className="course-icon"><Sparkles /></span><div><h1>Biology 101</h1><p>Fall semester 2026&nbsp; / &nbsp;Prof. Elena Martinez</p></div></div><button className="add-material"><Plus /> Add material</button></section><nav className="tabs">{([[FileText, "Notes", 8], [Folder, "Materials", 12], [SquarePen, "PDF annotation"], [BookOpen, "Flashcards", 24], [ListChecks, "Quizzes", 3]] as [ComponentType<{ className?: string }>, string, number?][]).map(([icon, label, count], index) => { const TabIcon = icon as ComponentType<{ className?: string }>; return <button className={index === 0 ? "active" : ""} key={label}><TabIcon />{label}{count && <small>{count}</small>}</button>; })}</nav><div className="editor-layout"><aside className="page-list"><div className="page-list-head"><span>PAGES · 8</span><Plus /></div><span className="unit-label">UNIT 3 · METABOLISM</span>{pages.map(([title, meta], index) => <button key={title} className={`page-item ${activePage === index ? "selected" : ""}`} onClick={() => setActivePage(index)}><FileText /><span><strong>{title}</strong><small>{meta}</small></span></button>)}<button className="new-page"><Plus /> New page</button><span className="unit-label linked">LINKED MATERIALS</span><div className="material-card"><b>PDF · 18 pages</b><strong>Ch. 9 — Cellular respiration</strong><small>6 annotations ↗</small></div><div className="lecture-card"><Headphones /><span><strong>Lecture 07</strong><small>42 min · Transcript ready</small></span><PlayCircle /></div></aside><article className="note-editor"><div className="editor-toolbar"><span>Normal text <ChevronDown /></span><b>B</b><i>I</i><u>U</u><span>⌁</span><span>🔗</span><span>☷</span><span>☑</span><Plus /><button><Sparkles /> Ask AI</button></div><div className="note-body"><div className="note-kicker">LECTURE 07 / ENERGY & METABOLISM</div><button className="note-more"><MoreHorizontal /></button><h2>{pages[activePage][0]}</h2><p className="note-meta">October 14, 2026&nbsp;&nbsp; · &nbsp;&nbsp;Prof. Elena Martinez <b>Midterm topic</b></p><div className="big-idea"><CircleHelp /><p><strong>The big idea</strong><span>Cells transfer the energy stored in glucose into ATP through a series of redox reactions. Oxygen is the final electron acceptor — not the source of ATP.</span></p></div><h3>01&nbsp; From glucose to usable energy</h3><p>Cellular respiration is a catabolic pathway: glucose is oxidized and oxygen is reduced. The released energy drives ATP synthesis, rather than being lost all at once as heat.</p><div className="equation">C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energy (ATP)</div><div className="stages"><div className="stages-heading"><span>ONE GLUCOSE. THREE STAGES.</span><b>≈ 30–32 ATP total</b></div><div className="stage-grid"><div><small>Cytoplasm</small><strong>Glycolysis</strong><span>Glucose → 2 pyruvate</span><b>2 ATP</b></div><ArrowRight /><div><small>Mitochondrial matrix</small><strong>Krebs cycle</strong><span>Acetyl-CoA → CO₂</span><b>2 ATP</b></div><ArrowRight /><div><small>Inner membrane</small><strong>Electron transport</strong><span>NADH + FADH₂ → H₂O</span><b>~26–28 ATP</b></div></div></div><h3>02&nbsp; Why the proton gradient matters <span className="audio"><Headphones /> 12:34</span></h3><p>The electron transport chain pumps H⁺ from the matrix into the intermembrane space. <strong>H⁺ flows back through ATP synthase</strong>, coupling the energy of the gradient to ATP production. This is chemiosmosis.</p><div className="exam-tip">Exam tip: the ETC builds the gradient; ATP synthase uses it. Don&apos;t confuse their roles.</div><h3>03&nbsp; Check my understanding <small className="complete">1 of 2 complete</small></h3><label className="check-row"><input type="checkbox" defaultChecked /> Explain substrate-level vs. oxidative phosphorylation.</label><label className="check-row"><input type="checkbox" /> What happens to ATP production if oxygen is unavailable?</label><div className="block-placeholder">Type / for blocks, or space for AI...</div></div></article></div></main><Assistant /></div>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = { ArrowLeft, ArrowRight };
