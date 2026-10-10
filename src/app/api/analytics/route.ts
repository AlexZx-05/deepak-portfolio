import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const section = String(body.section || "page").slice(0, 80);
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "Unknown";
  const db = await getDb();

  await db.collection("analytics").insertOne({
    section,
    country,
    path: String(body.path || "/").slice(0, 200),
    userAgent: request.headers.get("user-agent") || "",
    createdAt: new Date()
  });

  return NextResponse.json({ ok: true });
}
