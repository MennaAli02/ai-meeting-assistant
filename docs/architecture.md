# Architecture Overview

## System Diagram

User → Next.js Frontend → API Routes → Gemini AI
                       → Supabase DB

## Tech Decisions

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js + Tailwind | Fast, easy Vercel deployment |
| Backend | Next.js API Routes | Same codebase, no separate server |
| Database | Supabase | Free tier, built-in auth, PostgreSQL |
| AI | Google Gemini | Free tier, strong summarization |
| Deployment | Vercel | Free, connects directly to GitHub |

## Data Flow

1. User logs in via Supabase Auth
2. User fills meeting form and uploads transcript
3. Frontend sends transcript to `/api/analyze`
4. API route sends prompt to Gemini AI
5. Gemini returns structured JSON
6. Result saved to Supabase `meetings` table
7. User views, edits, and exports results