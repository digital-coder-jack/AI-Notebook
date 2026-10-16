import { ArrowRight, BookOpen, FileText, Folder, ListChecks, Search, Send, Sparkles, Check, Paperclip, Plus } from 'lucide-react';

export function HeroPreview() {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-4 bg-indigo-100/40 rounded-3xl blur-2xl -z-10" />

      {/* Window frame */}
      <div className="rounded-2xl border border-line/80 bg-paper-50 shadow-lift overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line/60 bg-paper-100">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-error/70" />
            <span className="h-3 w-3 rounded-full bg-warning/70" />
            <span className="h-3 w-3 rounded-full bg-success/70" />
          </div>
          <div className="mx-auto text-2xs text-ink-faint font-medium">
            AI Notebook — Biology 101
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex h-[440px] sm:h-[480px]">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col w-[200px] border-r border-line/60 bg-paper-200/50 p-3 gap-1">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="h-6 w-6 rounded-md bg-indigo flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-ink">AI Notebook</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-paper-100 border border-line/50 text-2xs text-ink-muted mb-2">
              <Search className="h-3 w-3" />
              <span>Search</span>
              <kbd className="ml-auto text-2xs text-ink-faint">⌘K</kbd>
            </div>

            {[
              { icon: BookOpen, label: 'Overview', active: false },
              { icon: FileText, label: 'My notebooks', active: true },
              { icon: Folder, label: 'Materials', active: false },
              { icon: ListChecks, label: 'Flashcards', active: false, count: '24' },
              { icon: Check, label: 'Quizzes', active: false, count: '3' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  item.active
                    ? 'bg-indigo-soft text-indigo font-semibold'
                    : 'text-ink-light hover:bg-paper-100'
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 ${item.active ? 'text-indigo' : 'text-ink-faint'}`} />
                <span>{item.label}</span>
                {item.count && <span className="ml-auto text-2xs text-ink-faint">{item.count}</span>}
              </div>
            ))}

            <div className="mt-auto pt-2 border-t border-line/50">
              <div className="text-2xs font-bold text-ink-faint px-2.5 mb-1.5">MY NOTEBOOKS</div>
              {[
                { label: 'Biology 101', active: true },
                { label: 'Organic Chem', active: false },
                { label: 'Statistics', active: false },
              ].map((nb) => (
                <div
                  key={nb.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    nb.active ? 'bg-indigo-soft text-indigo font-semibold' : 'text-ink-light hover:bg-paper-100'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-sm ${nb.active ? 'bg-indigo' : 'bg-line-strong'}`} />
                  <span>{nb.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note editor */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-line/60">
              <div>
                <div className="text-sm font-semibold text-ink">Cellular Respiration</div>
                <div className="text-2xs text-ink-faint">Lecture 07 · Oct 14</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-2xs text-ink-muted flex items-center gap-1 px-2 py-1 rounded-md hover:bg-paper-200 transition-colors">
                  <Paperclip className="h-3 w-3" /> 2
                </button>
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
            </div>

            <div className="flex-1 overflow-hidden px-5 py-4">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-indigo uppercase tracking-wide">
                  Key Concepts
                </div>
                <div className="text-sm text-ink leading-relaxed">
                  Cellular respiration is the process by which cells convert glucose into ATP through three main stages:
                </div>

                <div className="space-y-1.5 pl-3">
                  {['Glycolysis — breaks down glucose into pyruvate', 'Krebs cycle — produces NADH and FADH₂', 'Electron transport chain — generates ATP'].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-ink-light">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-indigo-soft text-indigo text-2xs font-bold flex items-center justify-center flex-none">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Highlighted concept */}
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5">
                  <div className="text-2xs font-bold text-indigo mb-1">KEY CONCEPT</div>
                  <div className="text-xs text-ink leading-relaxed">
                    The electron transport chain produces approximately <span className="font-semibold text-indigo">32–34 ATP</span> molecules per glucose molecule — the majority of ATP yield.
                  </div>
                </div>

                {/* Learning diagram */}
                <div className="rounded-lg border border-line/70 bg-paper-100 px-4 py-3">
                  <div className="text-2xs font-semibold text-ink-muted mb-2">LEARNING DIAGRAM</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="rounded-md bg-amber-100 border border-amber-200/60 px-2.5 py-1.5 text-2xs font-semibold text-amber-800">
                        Glucose
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-line-strong relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xs text-ink-faint">→</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="rounded-md bg-teal/15 border border-teal/20 px-2.5 py-1.5 text-2xs font-semibold text-teal">
                        Pyruvate
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-line-strong relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xs text-ink-faint">→</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="rounded-md bg-indigo-soft border border-indigo-200 px-2.5 py-1.5 text-2xs font-semibold text-indigo">
                        ATP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant panel */}
          <div className="hidden lg:flex flex-col w-[240px] border-l border-line/60 bg-paper-100/60">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line/60">
              <div className="h-6 w-6 rounded-full bg-indigo flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-ink">AI Assistant</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            </div>

            <div className="flex-1 overflow-hidden px-3.5 py-3 space-y-2.5">
              <div className="rounded-xl bg-paper-50 border border-line/50 px-3 py-2.5 text-xs text-ink-light leading-relaxed">
                <span className="font-semibold text-indigo text-2xs block mb-1">Suggestion</span>
                Turn this note into a quick recall session before your study group.
              </div>

              <div className="rounded-xl bg-indigo-soft/60 border border-indigo-200/40 px-3 py-2.5 text-xs text-ink leading-relaxed">
                <span className="font-semibold text-indigo text-2xs block mb-1">Explain</span>
                Almost! It's oxidative phosphorylation that stops, not all ATP production.
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Summarize', 'Quiz me', 'Flashcards'].map((action) => (
                  <span
                    key={action}
                    className="text-2xs font-medium text-indigo bg-indigo-50 border border-indigo-200/40 px-2.5 py-1 rounded-full"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-3 py-3 border-t border-line/60">
              <div className="flex items-center gap-2 rounded-xl bg-paper-50 border border-line/50 px-3 py-2">
                <span className="text-2xs text-ink-faint flex-1">Ask anything…</span>
                <Send className="h-3.5 w-3.5 text-indigo" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating note card */}
      <div className="hidden sm:flex absolute -left-6 top-24 flex-col rounded-xl border border-line/70 bg-paper-50 shadow-card p-3 w-44 animate-float">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-4 w-4 rounded bg-accent-rose/20 flex items-center justify-center">
            <Plus className="h-2.5 w-2.5 text-accent-rose" />
          </div>
          <span className="text-2xs font-semibold text-ink">New flashcard</span>
        </div>
        <div className="text-2xs text-ink-muted leading-relaxed">
          "What is the final electron acceptor in the ETC?"
        </div>
      </div>

      {/* Floating quiz card */}
      <div
        className="hidden sm:flex absolute -right-5 bottom-20 flex-col rounded-xl border border-line/70 bg-paper-50 shadow-card p-3 w-40 animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="h-4 w-4 rounded bg-success/15 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-success" />
          </div>
          <span className="text-2xs font-semibold text-ink">Quiz complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-ink">87%</span>
          <span className="text-2xs text-ink-muted">3/3 correct</span>
        </div>
      </div>
    </div>
  );
}
