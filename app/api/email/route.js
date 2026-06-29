import { geminiModel } from '@/lib/gemini'

export async function POST(request) {
  try {
    const { meetingInfo, aiResult } = await request.json()

    const prompt = `
Write a professional follow-up email based on this meeting.

Meeting: ${meetingInfo.title}
Date: ${meetingInfo.date}
Participants: ${meetingInfo.participants}

Summary: ${aiResult.executive_summary}

Action Items:
${aiResult.action_items?.map(a => `- ${a.task} (Owner: ${a.owner}, Due: ${a.due_date})`).join('\n')}

Decisions Made:
${aiResult.decisions_made?.join('\n')}

Write a clean, professional follow-up email with:
- Subject line
- Greeting
- Brief summary paragraph
- Action items section
- Closing

Return ONLY the email text, no extra explanation.
`

    const result = await geminiModel.generateContent(prompt)
    const email = result.response.text()
    return Response.json({ email })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}