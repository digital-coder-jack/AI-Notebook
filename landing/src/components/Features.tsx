import {
  BookOpen,
  BrainCircuit,
  FileText,
  Layers,
  ListChecks,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: 'Intelligent notebooks',
    description: 'Create structured notebooks for every course. Organize notes by lecture, topic, or study session with a clean hierarchical sidebar.',
    accent: 'indigo',
  },
  {
    icon: BrainCircuit,
    title: 'AI-assisted explanations',
    description: 'Highlight any concept and get instant, context-aware explanations. Ask follow-up questions and the AI uses your note content to answer.',
    accent: 'amber',
  },
  {
    icon: FileText,
    title: 'Study materials & PDFs',
    description: 'Upload PDFs and lecture slides directly into your notebook. The AI extracts key concepts so you can study without manual summarizing.',
    accent: 'teal',
  },
  {
    icon: Layers,
    title: 'Flashcards',
    description: 'Generate flashcards from your notes with one click. Review with spaced repetition to retain what matters before exams.',
    accent: 'rose',
  },
  {
    icon: ListChecks,
    title: 'Quizzes',
    description: 'Turn any notebook into a self-quiz. Get instant feedback on answers and track which topics need more review.',
    accent: 'sage',
  },
  {
    icon: MessageCircle,
    title: 'Context-aware study assistant',
    description: 'A built-in AI chat that knows your notes. Ask it to summarize, explain, quiz, or help you plan your next study session.',
    accent: 'indigo',
  },
];

const ACCENT_MAP: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo', border: 'border-indigo-200/40' },
  amber: { bg: 'bg-amber-100/60', text: 'text-amber-700', border: 'border-amber-200/40' },
  teal: { bg: 'bg-teal/10', text: 'text-teal', border: 'border-teal/15' },
  rose: { bg: 'bg-accent-rose/10', text: 'text-accent-rose', border: 'border-accent-rose/15' },
  sage: { bg: 'bg-accent-sage/10', text: 'text-accent-sage', border: 'border-accent-sage/15' },
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, visible } = useReveal<HTMLElement>();
  const accent = ACCENT_MAP[feature.accent];

  return (
    <article
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} group relative rounded-2xl border border-line/70 bg-paper-50 p-6 sm:p-7 transition-all duration-300 hover:shadow-card hover:border-indigo-200/50 hover:-translate-y-0.5`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
    >
      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${accent.bg} ${accent.border} border mb-4 transition-transform group-hover:scale-105`}>
        <feature.icon className={`h-6 w-6 ${accent.text}`} />
      </div>
      <h3 className="text-lg font-serif font-semibold text-ink mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-ink-light leading-relaxed">
        {feature.description}
      </p>
    </article>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <span className="text-sm font-semibold text-indigo uppercase tracking-wide">
            Features
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-ink leading-tight text-balance">
            Everything you need to study smarter.
          </h2>
          <p className="mt-4 text-base text-ink-light leading-relaxed">
            Six core tools working together inside a single workspace — so your notes, AI assistant, and study materials stay connected.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
