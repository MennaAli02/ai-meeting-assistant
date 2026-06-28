# Developer Handover Document

## Product Overview

AI Meeting Assistant transforms meeting transcripts into structured
business outputs using Google Gemini AI. Users upload transcripts,
the AI extracts summaries, action items, decisions, and risks.

## Folder Structure
ai-meeting-assistant/

├── app/                  # Next.js pages and API routes

│   ├── api/              # Backend API endpoints

│   ├── dashboard/        # Meeting dashboard page

│   ├── login/            # Auth page

│   └── meetings/         # Meeting detail pages

├── components/           # Reusable UI components

├── lib/                  # Supabase and Gemini clients

├── docs/                 # All documentation

├── public/               # Static assets

├── .env.local            # Environment variables (never commit)

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
| audio_url | text | URL to uploaded audio file |
| ai_result | jsonb | Full AI analysis result |
| created_at | timestamp | Creation timestamp |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/analyze | Send transcript, get AI analysis |
| GET | /api/meetings | Get all meetings for current user |
| POST | /api/meetings | Save a new meeting |

## Environment Variables

| Variable | Description |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase public key |
| GEMINI_API_KEY | Google Gemini API key |

## Known Limitations

- Audio transcription not implemented (text only for MVP)
- No real-time collaboration
- No email notifications yet

## Future Improvements

- Whisper API for audio transcription
- Calendar integration (Google Calendar)
- Email notifications via SendGrid
- Role-based access (admin, viewer, editor)
- Semantic search with vector embeddings