# AI Meeting Assistant

An AI-powered app that transforms meeting transcripts into structured business outputs including summaries, action items, decisions, risks, and follow-up emails.

## Features

- Upload meeting transcripts
- AI-powered analysis (summary, action items, risks, decisions)
- Export results as PDF
- Generate follow-up emails
- Search previous meetings
- Secure user authentication

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API |
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