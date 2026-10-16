# AI Notebook — Premium Landing Page

A premium, modern landing page for the AI Notebook study workspace, built with **Vite + React + TypeScript + Tailwind CSS + Lucide React**.

## Design

- Warm off-white backgrounds with deep ink text and restrained indigo accents
- Playfair Display for headings, DM Sans for body text
- Scroll-triggered reveal animations with `prefers-reduced-motion` support
- Fully responsive: mobile, tablet, and desktop
- Custom AI Notebook SVG logo (notebook + AI spark)

## Sections

1. **Header** — sticky navigation with mobile menu, logo + wordmark
2. **Hero** — headline, copy, CTAs, and a realistic product preview
3. **Features** — 6 feature cards (notebooks, AI, PDFs, flashcards, quizzes, assistant)
4. **Workspace Showcase** — notebook cards, upcoming tasks, editor preview with AI interaction
5. **How It Works** — 4-step process with connector lines
6. **Benefits** — checklist of key advantages
7. **FAQ** — 6 expandable questions
8. **Final CTA** — conversion section with indigo background
9. **Footer** — brand, navigation links, copyright

## Link Sharing Fix

The `src/lib/site.ts` module provides a single source of truth for URL generation:

- `buildUrl(path)` — derives the base URL from `window.location.origin` at runtime
- `buildShareUrl(resourceId, resourceType)` — builds a share link that always points to the production domain
- Never hardcodes `bolt.new`, `localhost`, or preview URLs
- In production, share links point to the real deployment domain

## Getting Started

```bash
cd landing
npm install
npm run dev      # local development
npm run build    # production build
npm run typecheck # type checking
```

## Structure

```
landing/
├── public/              # logo.svg, favicon.svg
├── src/
│   ├── components/      # Header, Hero, Features, etc.
│   ├── hooks/           # useReveal (scroll animations)
│   ├── lib/             # site.ts (URL config), 
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles, fonts, animations
├── index.html           # HTML with meta tags
├── tailwind.config.js   # Custom color system, animations
└── package.json
```
