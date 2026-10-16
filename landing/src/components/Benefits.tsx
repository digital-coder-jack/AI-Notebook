import { useReveal } from '@/hooks/useReveal';
import { Check } from 'lucide-react';

const BENEFITS = [
  'All your study tools in one place — no more switching between apps',
  'AI explanations grounded in your own notes, not generic web content',
  'Generate flashcards and quizzes from existing notes in seconds',
  'Organized notebooks keep every course separate and findable',
  'Upload PDFs and let the AI extract the key concepts for you',
  'Track quiz scores and flashcard mastery to know what to review next',
];

export function Benefits() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-28 bg-paper-200/40 border-y border-line/50">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-sm font-semibold text-indigo uppercase tracking-wide">Why AI Notebook</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ink leading-tight text-balance">
              Built for students who want depth, not noise.
            </h2>
            <p className="mt-4 text-base text-ink-light leading-relaxed">
              AI Notebook doesn't replace your study habits — it amplifies them. Your notes stay yours. The AI just helps you understand, recall, and test yourself faster.
            </p>
          </div>

          <div ref={ref} className={`reveal ${visible ? 'visible' : ''} space-y-3.5`}>
            {BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex-none mt-0.5 h-5 w-5 rounded-full bg-indigo-soft border border-indigo-200/40 flex items-center justify-center">
                  <Check className="h-3 w-3 text-indigo" />
                </div>
                <span className="text-sm text-ink-light leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
