import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroPreview } from '@/components/HeroPreview';

export function Hero() {
  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 dot-pattern opacity-60 -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: copy */}
          <div className="flex flex-col items-start max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3.5 py-1.5 mb-6 animate-fade-in-up">
              <Sparkles className="h-3.5 w-3.5 text-indigo" />
              <span className="text-xs font-semibold text-indigo">AI-powered study workspace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-ink leading-[1.1] text-balance animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Your notes, study materials, and AI — together in one workspace.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-ink-light leading-relaxed max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI Notebook brings intelligent notebooks, AI-assisted explanations, flashcards, quizzes, and study materials into a single organized environment built for serious learners.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo hover:bg-indigo-deep px-6 py-3.5 rounded-xl transition-all shadow-soft hover:shadow-glow group"
              >
                Open Your Workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-ink bg-paper-50 hover:bg-paper-200 border border-line hover:border-indigo-200 px-6 py-3.5 rounded-xl transition-all"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-semibold text-ink">6+</span>
                <span className="text-xs text-ink-muted">Study tools</span>
              </div>
              <div className="h-8 w-px bg-line" />
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-semibold text-ink">AI</span>
                <span className="text-xs text-ink-muted">Built-in assistant</span>
              </div>
              <div className="h-8 w-px bg-line" />
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-semibold text-ink">1</span>
                <span className="text-xs text-ink-muted">Workspace</span>
              </div>
            </div>
          </div>

          {/* Right: product preview */}
          <div className="relative lg:pl-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
