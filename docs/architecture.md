# Architecture Overview

## System Diagram

User → Next.js Frontend (TopNav + Pages) → API Routes → Gemini AI
                                         → Supabase DB (Auth + meetings table)

## Tech Decisions

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js + Tailwind v4 | Fast, easy Vercel deployment, modern CSS variable theming |
| Backend | Next.js API Routes | Same codebase, no separate server needed |
| Database | Supabase | Free tier, built-in auth, PostgreSQL, row-level security |
| AI | Google Gemini (gemini-2.5-flash) | Free tier, strong summarization and JSON extraction |
| Charts | Recharts | Lightweight, responsive, works well with React |
| Icons | Lucide React | Consistent icon set across the whole app |
| Theming | CSS variables + `.dark` class | Enables light/dark mode without a UI library |
| Deployment | Vercel | Free, connects directly to GitHub |

## Data Flow

1. User logs in via Supabase Auth
2. User fills meeting form and uploads/pastes transcript
3. Frontend sends transcript to `/api/analyze`
4. API route sends prompt to Gemini AI
5. Gemini returns structured JSON (summary, decisions, risks, action items, etc.)
6. Result saved to Supabase `meetings` table (`ai_result` jsonb column)
7. User views, edits status, exports PDF, or generates a follow-up email via `/api/email`
8. Dashboard aggregates all meetings into stats and charts (department, priority, type)
9. Calendar page groups meetings by date for visual scheduling overview

## Theming System

The app uses CSS custom properties defined in `app/globals.css`:
- `:root` defines light mode values (soft pastel cards, light background)
- `.dark` class on `<html>` overrides those values for dark mode
- `lib/useTheme.js` is a custom hook that reads/writes the theme to `localStorage` and toggles the `.dark` class
- All components reference colors via `var(--variable-name)` instead of hardcoded Tailwind colors, so theme switching requires no component-level logic

## Responsive Design

- `components/TopNav.js` collapses into a hamburger menu below the `md` breakpoint
- Dashboard stat cards go from 4 columns → 2 columns on mobile
- Analytics charts go from 3 columns → 1 column on mobile, with the donut+legend layout switching from side-by-side to stacked
- Meeting form fields stack to single column below `sm` breakpoint