import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const FAQS = [
  {
    q: 'What is AI Notebook?',
    a: 'AI Notebook is a study workspace that combines structured note-taking, AI-assisted explanations, flashcards, quizzes, and study material management in one organized application.',
  },
  {
    q: 'How does the AI assistant work?',
    a: 'The AI assistant reads your notes and provides context-aware explanations, summaries, and study suggestions. It can also generate flashcards and quizzes directly from the content you have already written.',
  },
  {
    q: 'Can I upload my own study materials?',
    a: 'Yes. You can upload PDFs and lecture slides into any notebook. The AI extracts key concepts from uploaded materials so you can review them without manually summarizing.',
  },
  {
    q: 'Is my data private?',
    a: 'Your notes and study materials are tied to your account. Share links are generated on a per-resource basis, so only the content you explicitly share is accessible to others.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. AI Notebook runs in your web browser. Open your workspace from any device with a modern browser.',
  },
  {
    q: 'Can I share my notes with classmates?',
    a: 'Yes. You can generate a share link for any notebook or note. The link points to the AI Notebook app, where the recipient can view the shared content directly.',
  },
];

function FaqItem({ item, index }: { item: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} border-b border-line/70 last:border-0`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        className="flex items-center justify-between w-full py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-semibold text-ink">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 text-ink-muted flex-none transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="pb-5 text-sm text-ink-light leading-relaxed pr-8">{item.a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-indigo uppercase tracking-wide">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ink leading-tight text-balance">
            Frequently asked questions.
          </h2>
        </div>

        <div className="rounded-2xl border border-line/70 bg-paper-50 px-6 sm:px-8 shadow-soft">
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
