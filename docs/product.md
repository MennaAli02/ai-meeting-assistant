# Product Documentation

## Problem Statement

Companies waste hundreds of hours monthly on manual meeting documentation.
Writing summaries, extracting action items, and sending follow-ups is
repetitive, error-prone, and delays team execution.

## User Personas

**Sarah - Team Lead**
- Runs 5+ meetings per week
- Spends 30 min after each meeting writing notes
- Needs action items tracked with clear owners and due dates
- Wants a quick visual overview of upcoming meetings (calendar)

**Ahmed - Department Manager**
- Needs executive summaries of meetings he missed
- Wants to track decisions and risks across teams
- Cares about trends: which departments meet most, where risk concentrates

## User Journey

1. Sign in to the app
2. View dashboard: stats, mini calendar, recent analyzed meetings, analytics charts
3. Create a new meeting (title, date, participants, department, type)
4. Upload or paste the transcript
5. AI analyzes and returns structured output
6. User reviews results, exports PDF, or generates a follow-up email
7. User searches past meetings by keyword, participant, or AI-extracted content
8. User checks the calendar page to see meetings grouped by date
9. User toggles dark mode if preferred

## MVP Scope

- Auth (sign in / sign up)
- Create meeting + upload transcript
- AI analysis with all required fields (summary, decisions, risks, open questions, action items, follow-ups)
- Export as PDF
- Generate follow-up email
- Dashboard with meeting history and search
- Calendar view with meeting markers
- Analytics: meetings by department, action items by priority, meeting types breakdown
- Light/dark mode
- Responsive layout (mobile, tablet, desktop)

## Future Roadmap

- Audio file transcription (Whisper API)
- Google Calendar sync (currently visual-only, no external sync)
- Email notifications
- Role-based access control
- Chat with previous meetings (RAG-based Q&A)
- Inline editing of AI results before saving