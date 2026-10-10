import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  const db = await getDb();
  const availability = await db.collection("settings").findOne({ key: "availability" });
  return NextResponse.json(availability ?? {});
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const db = await getDb();
  await db.collection("settings").updateOne(
    { key: "availability" },
    { $set: { ...body, key: "availability", updatedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
