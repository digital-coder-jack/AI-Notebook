# Notely workspace implementation plan

## Scope
Replace the existing single notebook/editor mock in `web/app/page.tsx` with a cohesive responsive Notely application workspace while preserving the existing backend, authentication, API, landing page and Android project.

## Screen inventory and navigation
- Overview dashboard: welcome, global search, New note, Ask AI, recent/pinned notes, study plan and upcoming revision.
- My notes: searchable notes list, filters, pinned/favorites, editor preview and note actions.
- AI assistant: grounded conversation workspace and composer.
- Documents: library with upload/import affordance and processing states.
- Favorites, archive and trash: dedicated filtered content views.
- Study tools hub plus Quiz generator, Flashcards, Study roadmap, Mind maps and Revision planner.
- Search: grouped notes/documents/tools results.
- Settings/Profile: account, appearance, editor, security, privacy, AI providers and notifications sections.
- Existing backend/auth and Android code remain outside this UI pass.

All app destinations use history-backed routes (`/app/...`) with a Next rewrite so direct URL refreshes resolve to the workspace shell.

## Design system
- Reuse the repository's Notely logo asset from `web-react/public/logo-wordmark.svg` and `logo-symbol.svg`.
- Preserve the landing page's dark navy/ink, cyan and blue identity, with a quiet paper-like light workspace surface and cyan-to-blue accent gradient.
- Use DM Sans for UI and a restrained serif display face for key editorial headings.
- Shared tokens for surfaces, borders, radii, shadows, spacing and focus rings; no decorative stock imagery.
- Motion is purposeful: short transitions for drawer, route panels and active states; reduced-motion support included.

## Project structure
- `web/app/page.tsx`: client workspace shell, route state, screen components and interactions.
- `web/app/globals.css`: design tokens, layout, screen and responsive styles.
- `web/public/logo-symbol.svg`, `logo-wordmark.svg`: copied repository brand assets.
- `web/public/manus-routes.json`: route manifest for supported UI paths.
- `web/next.config.mjs`: rewrite supported app paths to the app shell.
