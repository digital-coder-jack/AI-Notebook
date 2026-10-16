import { Logo } from '@/components/Logo';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Use cases', href: '#use-cases' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Get Started', href: '#get-started' },
      { label: 'Sign in', href: '#signin' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-paper-200/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo className="h-8 w-8" />
              <span className="font-serif text-xl font-semibold text-ink tracking-tight">
                AI Notebook
              </span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed max-w-sm">
              Your AI-powered learning workspace. Notes, study materials, flashcards, quizzes, and AI assistance — together in one organized place.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-3.5">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-light hover:text-indigo transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-line/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} AI Notebook. All rights reserved.
          </p>
          <p className="text-xs text-ink-faint">
            Built for learners who want depth, not noise.
          </p>
        </div>
      </div>
    </footer>
  );
}
