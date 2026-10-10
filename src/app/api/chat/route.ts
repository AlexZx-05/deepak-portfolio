import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";

const defaultPrompt = "You are Deepak Sharma's portfolio assistant. Answer questions about his work, skills, services, and contact options clearly and briefly.";

async function getSystemPrompt() {
  try {
    const db = await getDb();
    const setting = await db.collection("settings").findOne({ key: "aiPrompt" });
    return String(setting?.prompt || defaultPrompt);
  } catch {
    return defaultPrompt;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  const body = await request.json();
  const message = String(body.message || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ reply: "AI chat is not configured yet. Please add GROQ_API_KEY." });
  }

  const systemPrompt = await getSystemPrompt();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Groq error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  return NextResponse.json({ reply: reply || "I could not generate a reply." });
}