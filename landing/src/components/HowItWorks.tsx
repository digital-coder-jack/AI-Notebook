import { useReveal } from '@/hooks/useReveal';
import { FileText, Sparkles, ListChecks, GraduationCap } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    title: 'Create a notebook',
    description: 'Start a notebook for each course or topic. Add notes lecture by lecture, or upload your existing PDFs and slides.',
  },
  {
    icon: Sparkles,
    title: 'Let AI assist',
    description: 'Highlight any concept for an instant explanation. Ask the AI assistant to summarize, elaborate, or create study materials from your notes.',
  },
  {
    icon: ListChecks,
    title: 'Study and test yourself',
    description: 'Generate flashcards and quizzes from your notes in one click. Review with spaced repetition and track which areas need more work.',
  },
  {
    icon: GraduationCap,
    title: 'Track your progress',
    description: 'See quiz scores, flashcard mastery, and upcoming study tasks in one dashboard so you always know what to review next.',
  },
];

export function HowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <span className="text-sm font-semibold text-indigo uppercase tracking-wide">How it works</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ink leading-tight text-balance">
            From notes to mastery in four steps.
          </h2>
          <p className="mt-4 text-base text-ink-light leading-relaxed">
            No setup, no configuration. Start writing notes and the AI tools are ready when you need them.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`reveal ${visible ? 'visible' : ''} relative`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-gradient-to-r from-indigo-200/60 to-transparent" />
              )}

              <div className="relative flex flex-col items-start">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-200/40 shadow-soft">
                    <step.icon className="h-6 w-6 text-indigo" />
                  </div>
                  <span className="font-serif text-2xl font-semibold text-indigo-200">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-serif font-semibold text-ink mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
