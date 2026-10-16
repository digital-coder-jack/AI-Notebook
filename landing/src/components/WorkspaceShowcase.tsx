import { BookOpen, FileText, Folder, Check, ListChecks, BrainCircuit, CalendarDays } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} max-w-2xl mb-12`}>
      <span className="text-sm font-semibold text-indigo uppercase tracking-wide">{label}</span>
      <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ink leading-tight text-balance">
        {title}
      </h2>
      <p className="mt-4 text-base text-ink-light leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function WorkspaceShowcase() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="use-cases" className="py-20 lg:py-28 bg-paper-200/40 border-y border-line/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          label="The workspace"
          title="A workspace that thinks alongside you."
          subtitle="See how notebooks, notes, AI explanations, and study tools come together in one organized environment."
        />

        <div
          ref={ref}
          className={`reveal-scale ${visible ? 'visible' : ''} grid lg:grid-cols-3 gap-5 lg:gap-6`}
        >
          {/* Notebook cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-line/70 bg-paper-50 p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-indigo" />
                <span className="text-sm font-semibold text-ink">Your notebooks</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Biology 101', notes: 18, color: 'bg-indigo', last: 'Oct 16' },
                  { name: 'Organic Chemistry', notes: 24, color: 'bg-accent-rose', last: 'Oct 14' },
                  { name: 'Statistics', notes: 12, color: 'bg-accent-teal', last: 'Oct 12' },
                  { name: 'World History', notes: 8, color: 'bg-accent-amber', last: 'Oct 10' },
                ].map((nb) => (
                  <div
                    key={nb.name}
                    className="flex items-center gap-3 rounded-xl border border-line/50 bg-paper-100/50 p-3 hover:border-indigo-200/50 hover:bg-paper-50 transition-all cursor-pointer group"
                  >
                    <div className={`h-8 w-8 rounded-lg ${nb.color} flex items-center justify-center flex-none`}>
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink truncate">{nb.name}</div>
                      <div className="text-2xs text-ink-muted">{nb.notes} notes · Updated {nb.last}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line/70 bg-paper-50 p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-indigo" />
                <span className="text-sm font-semibold text-ink">Upcoming</span>
              </div>
              <div className="space-y-2">
                {[
                  { task: 'Review Ch. 7 notes', time: 'Today', done: true },
                  { task: 'Biology study group', time: '3:00 PM', done: false },
                  { task: 'Quiz: Krebs cycle', time: 'Tomorrow', done: false },
                ].map((item) => (
                  <div key={item.task} className="flex items-center gap-2.5 text-sm">
                    <div className={`h-4 w-4 rounded border flex items-center justify-center flex-none ${
                      item.done ? 'bg-indigo border-indigo' : 'border-line-strong bg-paper-100'
                    }`}>
                      {item.done && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <span className={`flex-1 ${item.done ? 'text-ink-muted line-through' : 'text-ink-light'}`}>
                      {item.task}
                    </span>
                    <span className="text-2xs text-ink-faint">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main editor preview */}
          <div className="lg:col-span-2 rounded-2xl border border-line/70 bg-paper-50 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line/60 bg-paper-100">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-error/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
              </div>
              <span className="mx-auto text-2xs text-ink-faint font-medium">
                Biology 101 — Cellular Respiration
              </span>
            </div>

            <div className="flex h-[420px]">
              {/* Mini sidebar */}
              <div className="hidden md:flex flex-col w-44 border-r border-line/60 bg-paper-200/40 p-2.5 gap-0.5">
                {[
                  { icon: BookOpen, label: 'Overview', active: false },
                  { icon: FileText, label: 'Notes', active: true },
                  { icon: Folder, label: 'Materials', active: false },
                  { icon: ListChecks, label: 'Flashcards', active: false },
                  { icon: Check, label: 'Quizzes', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                      item.active ? 'bg-indigo-soft text-indigo font-semibold' : 'text-ink-light'
                    }`}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${item.active ? 'text-indigo' : 'text-ink-faint'}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Editor content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="text-lg font-serif font-semibold text-ink mb-1">Cellular Respiration</div>
                <div className="text-2xs text-ink-faint mb-4">Lecture 07 · Oct 14 · 2 materials attached</div>

                <div className="space-y-3">
                  <div className="text-xs text-ink-light leading-relaxed">
                    Cellular respiration converts glucose into ATP through three stages: glycolysis, the Krebs cycle, and the electron transport chain.
                  </div>

                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
                    <div className="text-2xs font-bold text-indigo mb-1">KEY CONCEPT</div>
                    <div className="text-xs text-ink leading-relaxed">
                      The electron transport chain produces ~32–34 ATP per glucose — the majority of energy yield.
                    </div>
                  </div>

                  {/* AI interaction */}
                  <div className="rounded-xl border border-line/60 bg-paper-100/60 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full bg-indigo flex items-center justify-center">
                        <BrainCircuit className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-2xs font-semibold text-ink">AI Study Assistant</span>
                    </div>
                    <div className="text-xs text-ink-light leading-relaxed pl-7">
                      "Explain oxidative phosphorylation in simple terms."
                    </div>
                    <div className="mt-2 rounded-lg bg-indigo-soft/50 border border-indigo-200/30 p-2.5 pl-7">
                      <div className="text-xs text-ink-light leading-relaxed">
                        It's the final stage where electrons move through protein complexes, pumping protons to create a gradient that powers ATP synthase — the cell's energy factory.
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 pl-7">
                      {['Summarize', 'Quiz me', 'Make flashcards'].map((a) => (
                        <span key={a} className="text-2xs font-medium text-indigo bg-indigo-50 border border-indigo-200/40 px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
