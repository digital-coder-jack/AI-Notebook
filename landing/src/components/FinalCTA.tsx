import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

export function FinalCTA() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="get-started" className="py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div
          ref={ref}
          className={`reveal-scale ${visible ? 'visible' : ''} relative overflow-hidden rounded-3xl bg-indigo px-6 sm:px-12 py-14 sm:py-20 text-center shadow-lift`}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '32px 32px, 48px 48px',
              }}
            />
          </div>

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight text-balance">
              Start studying smarter today.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-indigo-100 leading-relaxed max-w-xl mx-auto">
              Open your AI Notebook workspace and bring your notes, study materials, and AI-powered learning together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo bg-white hover:bg-paper-100 px-6 py-3.5 rounded-xl transition-all shadow-soft group"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 px-6 py-3.5 rounded-xl transition-all"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
