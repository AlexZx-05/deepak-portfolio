import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  const db = await getDb();
  const hero = await db.collection("hero").findOne({ key: "main" });
  return NextResponse.json(hero ?? {});
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const db = await getDb();
  await db.collection("hero").updateOne(
    { key: "main" },
    { $set: { ...body, key: "main", updatedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
