import { geminiModel } from '@/lib/gemini'

export async function POST(request) {
  try {
    const { transcript, meetingInfo } = await request.json()

    if (!transcript) {
      return Response.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const prompt = `
You are an expert meeting analyst. Analyze this meeting transcript carefully and return a JSON object with exactly these fields. Be specific and extract real information from the transcript.

{
  "executive_summary": "2-3 sentence summary of the entire meeting",
  "key_discussion_points": ["point 1", "point 2", "point 3"],
  "decisions_made": ["decision 1", "decision 2"],
  "risks": ["risk 1", "risk 2"],
  "open_questions": ["question 1", "question 2"],
  "action_items": [
    {
      "task": "specific task description",
      "owner": "person name",
      "due_date": "YYYY-MM-DD or suggested timeframe",
      "priority": "High or Medium or Low"
    }
  ],
  "follow_up_recommendations": ["recommendation 1", "recommendation 2"]
}

Meeting Information:
- Title: ${meetingInfo.title}
- Date: ${meetingInfo.date}
- Participants: ${meetingInfo.participants}
- Department: ${meetingInfo.department}
- Type: ${meetingInfo.meeting_type}

Transcript:
${transcript}

IMPORTANT: Return ONLY the JSON object. No explanation, no markdown, no backticks. Just the raw JSON.
`

    const result = await geminiModel.generateContent(prompt)
    const text = result.response.text()

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const aiResult = JSON.parse(cleaned)

    return Response.json({ result: aiResult })

  } catch (error) {
    console.error('Analyze error:', error)
    return Response.json(
      { error: 'Failed to analyze transcript: ' + error.message },
      { status: 500 }
    )
  }
}