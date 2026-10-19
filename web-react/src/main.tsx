import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Page = 'Home' | 'Notebooks' | 'Study' | 'Planner' | 'More';

const navItems: Page[] = ['Home', 'Notebooks', 'Study', 'Planner', 'More'];

function Header({ back = false }: { back?: boolean }) {
  return <header className="topbar"><div className="brand">{back && <span className="back">‹</span>}Notely</div><div className="header-meta"><span className="search-dot">⌕</span><span>JL</span></div></header>;
}

function Button({ children, secondary = false, onClick }: { children: React.ReactNode; secondary?: boolean; onClick?: () => void }) {
  return <button className={secondary ? 'button secondary' : 'button'} onClick={onClick}>{children}</button>;
}

function Card({ children, tone = '', className = '' }: { children: React.ReactNode; tone?: string; className?: string }) {
  return <section className={`card ${tone} ${className}`}>{children}</section>;
}

function BottomNav({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  return <nav className="bottom-nav">{navItems.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>{item}</button>)}</nav>;
}

function Home({ setPage }: { setPage: (page: Page) => void }) {
  return <>
    <Header />
    <main>
      <div className="eyebrow">FRIDAY, OCTOBER 16 · A LITTLE PROGRESS, ONE IDEA AT A TIME.</div>
      <h1>Good morning, Jamie</h1>
      <p className="subhead">A calmer place to pick up where you left off.</p>
      <Card tone="lavender" className="hero-card">
        <div className="eyebrow">BIOLOGY 101 · LECTURE 07</div><h2>Cellular respiration</h2>
        <p>How does a proton gradient become usable energy? Continue your note before today’s study group.</p>
        <div className="muted">8 note pages <span className="green">All changes saved</span></div>
        <Button onClick={() => setPage('Notebooks')}>→ &nbsp; Continue writing</Button>
      </Card>
      <div className="eyebrow section-label">YOUR NOTEBOOKS</div>
      {['Biology 101|Prof. Elena Martinez · 8 pages · Updated Oct 14','Organic Chemistry|6 pages · Reaction mechanisms','World History|5 pages · Industrial revolutions'].map(([title, detail]) => <Card key={title} className="list-card"><div className="line-icon">◌</div><div><strong>{title}</strong><small>{detail}</small></div></Card>)}
      <Card><h3>A quick recall session</h3><p>12 Biology cards are ready for review. Five focused minutes can make the next lecture feel easier.</p><Button secondary onClick={() => setPage('Study')}>▱ &nbsp; Review flashcards</Button></Card>
      <Card><h3>On your calendar</h3><div className="eyebrow blue">TODAY · OCT 16</div><h3>Biology study group</h3><p>3:00–4:00 PM · Library, room 2B</p><Button secondary onClick={() => setPage('Planner')}>View calendar</Button></Card>
      <Card><h3>Coming up</h3><div className="mini-row">□ <strong>Lab report: yeast respiration</strong><small>Biology 101 · Due Oct 17</small></div><div className="mini-row">□ <strong>Mechanisms problem set</strong><small>Organic Chemistry · Due Oct 19</small></div></Card>
      <Card><h3>Your study rhythm</h3><div className="metric">20 / 30 <span>min</span></div><div className="progress"><i style={{width:'38%'}} /></div><small>Today’s study goal · 10 minutes to go</small></Card>
    </main>
  </>;
}

function Notebooks() {
  const books = [['Biology 101','Prof. Elena Martinez','Cellular respiration','8 note pages · 12 materials','8'],['Organic Chemistry','Chemistry · Fall 2026','Reaction mechanisms','6 note pages · 7 materials','6'],['World History','Humanities · Fall 2026','Industrial revolutions','5 note pages · 5 materials','5']];
  return <><Header /><main><h1>My notebooks</h1><p className="subhead">A home for every course, and every connection you make.</p><Button>＋ New notebook</Button><div className="filter-row blue">Fall semester 2026 <span>All notebooks · 3</span><span>Recently updated ↓</span></div>{books.map(([title, detail, recent, count]) => <Card key={title} className="notebook-card"><div className="eyebrow">FALL SEMESTER 2026</div><h2>{title}</h2><small>{detail}</small><p className="tiny-bold">{count} note pages · 12 materials</p><p className="tiny-bold">24 flashcards · 3 quizzes</p><div className="inset"><div className="eyebrow">LAST OPENED</div><h3>{recent}</h3><small>Continue from your last note</small></div><Button secondary>→ &nbsp; Open notebook</Button></Card>)}<div className="eyebrow section-label">RECENT PAGES</div>{['Cellular respiration','Lab: yeast respiration','Substitution vs. elimination'].map((x) => <Card key={x} className="list-card"><div className="line-icon">▧</div><div><strong>{x}</strong><small>Biology 101 · Lecture 07 · October 14, 2026</small></div></Card>)}</main></>;
}

function Study() {
  return <><Header /><main><h1>Study assistant</h1><p className="subhead">A study partner grounded in your course, not a shortcut.</p><div className="filter-row blue">Biology 101 <span>Current note</span><span>2 source materials</span></div><Card tone="lavender" className="question"><p>Why does ATP production stop without oxygen?</p></Card><div className="eyebrow section-label">◇ NOTELY · ANSWER WITH SOURCES</div><p>Almost! It’s oxidative phosphorylation that stops, not all ATP production. Here’s the chain reaction:</p>{[['1','The electron chain backs up','Without O₂ to accept electrons at the end of the chain, electron transfer cannot keep running.'],['2','The H⁺ gradient fades','Proton pumping stops. ATP synthase loses the gradient that powers ATP synthesis.'],['3','Glycolysis can still make ATP','If fermentation regenerates NAD⁺, glycolysis can continue to yield a net 2 ATP per glucose.']].map(([n,t,d]) => <div className="answer" key={n}><b>{n}</b><div><strong>{t}</strong><p>{d}</p></div></div>)}<Card><div className="eyebrow">SOURCE CITATIONS</div><p>[1] Ch. 9 — Cellular respiration · p. 7</p><p>[2] Lecture 07 · 12:34–14:02</p><small>Sources are from your Biology 101 materials.</small></Card><Button secondary>▧ &nbsp; Insert into note</Button> <Button secondary>▣ &nbsp; Copy answer</Button><Card><h3>Make it stick</h3><div className="muted"><span className="blue">8 proposed flashcards</span> &nbsp; <span className="amber">Not saved</span></div><p>Preview this AI-generated set before adding it to your Biology deck.</p><Card tone="lavender"><div className="eyebrow">PROPOSED CARD</div><h3>What is the final electron acceptor in cellular respiration?</h3><p>Oxygen (O₂), which is reduced to water.</p></Card><Button secondary>▱ &nbsp; Review 8 proposed cards</Button></Card><div className="ask-box">Ask about your notes or materials... <Button>↑ &nbsp; Send</Button></div></main></>;
}

function Planner() {
  return <><Header /><main><h1>Tasks</h1><p className="subhead">Give every deadline a place, and your mind a little room.</p><Button>＋ New task</Button><div className="filter-row blue">Upcoming · 4 <span>Completed</span><span>All courses</span><span>By due date ↓</span></div>{['Lab report: yeast respiration|Biology 101 · Due Oct 17, 11:59 PM|In progress','Mechanisms problem set|Organic Chemistry · Due Oct 19, 9:00 AM|','Read Ch. 10 — Photosynthesis|Biology 101 · Due Oct 20, 10:00 AM|','Industrialization essay outline|World History · Due Oct 21, 5:00 PM|'].map(([title, detail, status], i) => <div key={title}><div className="eyebrow day-label">{['TOMORROW · OCTOBER 17','MONDAY · OCTOBER 19','TUESDAY · OCTOBER 20','WEDNESDAY · OCTOBER 21'][i]}</div><Card className={i === 0 ? 'list-card lavender' : 'list-card'}><div className="checkbox">□</div><div><strong>{title}</strong><small>{detail}</small>{status && <small className="blue">{status}</small>}</div></Card></div>)}<Card><h2>Lab report: yeast respiration</h2><div className="eyebrow blue">BIOLOGY 101</div><p>Compare CO₂ production under aerobic and anaerobic conditions. Explain the relationship to ATP yield.</p><label>Due date<input value="October 17, 2026 · 11:59 PM" readOnly /></label><div className="eyebrow">CHECKLIST · 1 OF 3 COMPLETE</div><p>☑ Organize observations</p><p>□ Draft results and discussion</p><p>□ Add references and proofread</p><Button>✓ &nbsp; Mark complete</Button></Card></main></>;
}

function More({ setPage }: { setPage: (page: Page) => void }) {
  return <><Header /><main><h1>Course materials</h1><p className="subhead">Readings, slides, and references — close to your notes.</p><Button>＋ Add material</Button><div className="filter-row blue">Biology 101 · 12 <span>All courses · 24</span><span>PDFs</span><span>Slides</span></div>{['Ch. 9 — Cellular respiration','Lecture 07 — Energy & metabolism','Yeast respiration — lab guide','Ch. 10 — Photosynthesis','ATP synthase: a molecular motor','Metabolism — midterm reading list'].map((x, i) => <Card key={x} className={i === 0 ? 'list-card lavender' : 'list-card'}><div className="line-icon">{i === 4 ? '↗' : '▧'}</div><div><strong>{x}</strong><small>{i === 0 ? 'PDF · 18 pages · Added Oct 14' : 'Biology 101 · Recently added'}</small></div></Card>)}<Card><div className="large-icon">⌁</div><h2>Bring your sources in</h2><p>Upload PDFs, lecture slides, or documents. Link them to a course so your assistant can cite them.</p><Button>⇧ &nbsp; Choose files</Button> <Button secondary>↗ &nbsp; Add a link</Button></Card><Card><h2>Selected material</h2><div className="eyebrow blue">BIOLOGY 101</div><h2>Ch. 9 — Cellular respiration</h2><p>18 pages · 6 annotations · Linked to Cellular respiration</p><Button secondary>▣ &nbsp; Open PDF</Button></Card><Card><h2>All tools</h2>{['Course materials','Flashcards','Quizzes','Tasks','Calendar','Recorded lectures','Study assistant'].map(x => <div className="mini-row" key={x}><span className="line-icon">▧</span><strong>{x}</strong><small>Open workspace tool</small></div>)}</Card></main></>;
}

function App() {
  const [page, setPage] = useState<Page>('Home');
  return <div className="app"><div className="device"><div className="status"><span>9:41</span><span>LTE ▰</span></div>{page === 'Home' && <Home setPage={setPage} />}{page === 'Notebooks' && <Notebooks />}{page === 'Study' && <Study />}{page === 'Planner' && <Planner />}{page === 'More' && <More setPage={setPage} />}<BottomNav page={page} setPage={setPage} /></div></div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
