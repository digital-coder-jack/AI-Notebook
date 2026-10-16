import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Use cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-paper/85 backdrop-blur-lg border-b border-line/60 shadow-soft'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <a href="#" className="flex items-center gap-2.5 group" aria-label="AI Notebook home">
            <Logo className="h-8 w-8 sm:h-9 sm:w-9 transition-transform group-hover:scale-105" />
            <span className="font-serif text-xl sm:text-2xl font-semibold text-ink tracking-tight">
              AI Notebook
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-ink-light hover:text-indigo transition-colors rounded-lg hover:bg-indigo-50/60"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#signin"
              className="text-sm font-medium text-ink-light hover:text-indigo transition-colors px-4 py-2"
            >
              Sign in
            </a>
            <a
              href="#get-started"
              className="text-sm font-semibold text-white bg-indigo hover:bg-indigo-deep px-5 py-2.5 rounded-xl transition-all shadow-soft hover:shadow-glow"
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-ink hover:bg-paper-300 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-paper/95 backdrop-blur-lg z-40 animate-fade-in">
          <nav
            className="flex flex-col px-5 py-6 gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3.5 text-base font-medium text-ink hover:text-indigo hover:bg-indigo-50/60 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-line my-3" />
            <a
              href="#signin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3.5 text-base font-medium text-ink-light hover:text-indigo rounded-xl transition-colors"
            >
              Sign in
            </a>
            <a
              href="#get-started"
              onClick={() => setMenuOpen(false)}
              className="mt-2 text-center text-base font-semibold text-white bg-indigo hover:bg-indigo-deep px-5 py-3.5 rounded-xl transition-all shadow-soft"
            >
              Get Started
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
