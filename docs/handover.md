# Developer Handover Document

## Product Overview

AI Meeting Assistant transforms meeting transcripts into structured
business outputs using Google Gemini AI. Users upload transcripts,
the AI extracts summaries, action items, decisions, and risks, and
the dashboard visualizes meeting activity over time.

## Folder Structure
ai-meeting-assistant/
├── app/
│   ├── api/
│   │   ├── analyze/route.js     # Gemini transcript analysis endpoint
│   │   └── email/route.js       # Gemini follow-up email generation endpoint
│   ├── calendar/page.js         # Full calendar view
│   ├── dashboard/page.js        # Main dashboard (stats, search, mini calendar, charts)
│   ├── login/page.js            # Auth page
│   ├── meetings/
│   │   ├── new/page.js          # Meeting creation form
│   │   └── [id]/analyze/page.js # AI results, PDF export, email modal
│   ├── globals.css              # Theme variables (light/dark), Tailwind import
│   └── layout.js                # Root layout, font setup
├── components/
│   └── TopNav.js                # Responsive navbar with theme toggle
├── lib/
│   ├── supabase.js              # Supabase client
│   ├── gemini.js                # Gemini client
│   └── useTheme.js              # Dark mode hook (localStorage + class toggle)
├── docs/                        # All documentation
├── public/
├── .env.local                   # Environment variables (never commit)
└── README.md

## Database Design

Table: `meetings`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| title | text | Meeting title |
| date | date | Meeting date |
| participants | text[] | List of participant names |
| department | text | Department name |
| meeting_type | text | Type of meeting |
| transcript | text | Raw transcript text |
| audio_url | text | URL to uploaded audio file (unused in MVP) |
| ai_result | jsonb | Full AI analysis result |
| created_at | timestamp | Creation timestamp |

Row-level security: enabled, policy restricts all access to `auth.uid() = user_id`.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/analyze | Send transcript + meeting info, get structured AI analysis |
| POST | /api/email | Send AI result, get a generated follow-up email |

## Environment Variables

| Variable | Description |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase public key |
| GEMINI_API_KEY | Google Gemini API key |

## Theming

- Colors are defined as CSS variables in `app/globals.css` under `:root` (light) and `.dark` (dark)
- `lib/useTheme.js` toggles the `.dark` class on `<html>` and persists the choice in `localStorage`
- Any new component should use `style={{ color: 'var(--text-primary)' }}` etc. instead of hardcoded Tailwind gray/white classes, to stay theme-consistent

## Known Limitations

- Audio transcription not implemented (text/transcript input only)
- Calendar is visual-only — no sync with Google Calendar or external providers
- No real-time collaboration or multi-user editing of a single meeting
- No email sending (follow-up emails are generated and copied, not sent automatically)
- No automated tests yet

## Future Improvements

- Whisper API for audio transcription
- Real Google Calendar integration (read/write events)
- Email sending via SendGrid or Resend
- Role-based access (admin, viewer, editor)
- Semantic search with vector embeddings for true "chat with your meetings"
- Unit and integration tests
- CI/CD pipeline via GitHub Actions
