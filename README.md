# AI Meeting Assistant

An AI-powered app that transforms meeting transcripts into structured business outputs including summaries, action items, decisions, risks, and follow-up emails — with analytics and calendar tracking built in.

## Features

- Upload meeting transcripts
- AI-powered analysis (summary, action items, risks, decisions, open questions, follow-ups)
- Export results as PDF
- Generate follow-up emails with AI
- Search previous meetings (including inside AI results)
- Secure user authentication
- Dashboard with analytics charts (department breakdown, action item priority, meeting types)
- Calendar view with meeting markers
- Light/Dark mode toggle
- Fully responsive design (mobile, tablet, desktop)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API (gemini-2.5-flash) |
| Charts | Recharts |
| Icons | Lucide React |
| Font | Plus Jakarta Sans |
| Deployment | Vercel |

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-meeting-assistant.git
cd ai-meeting-assistant
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local`
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GEMINI_API_KEY=your_key

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `GEMINI_API_KEY` | Your Google Gemini API key |

## Pages

| Route | Description |
|---|---|
| `/login` | Sign in / sign up |
| `/dashboard` | Main dashboard with stats, search, mini calendar, recent activity, and analytics |
| `/calendar` | Full calendar view of all meetings by date |
| `/meetings/new` | Create a new meeting and upload a transcript |
| `/meetings/[id]/analyze` | AI analysis results, PDF export, email generation |