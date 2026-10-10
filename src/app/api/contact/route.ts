import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendNotification(message: { name: string; email: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Portfolio message from ${message.name}`,
      reply_to: message.email,
      text: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`
    })
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid contact message" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("messages").insertOne({
    name,
    email,
    message,
    read: false,
    createdAt: new Date()
  });

  await sendNotification({ name, email, message }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
