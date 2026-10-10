import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { normalizeSiteContent } from "../../../../lib/content";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const setting = await db.collection("settings").findOne({ key: "siteContent" });
  return NextResponse.json(normalizeSiteContent(setting?.content));
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Site content must be a JSON object." }, { status: 400 });
  }

  const content = normalizeSiteContent(body);
  const db = await getDb();
  await db.collection("settings").updateOne(
    { key: "siteContent" },
    { $set: { key: "siteContent", content, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
