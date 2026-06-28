import { geminiModel } from "@/lib/gemini";

export async function GET() {
  try {
    const result = await geminiModel.generateContent("Say hello in one sentence.");
    const text = result.response.text();
    return Response.json({ message: text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}