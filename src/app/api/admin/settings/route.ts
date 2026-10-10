import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key");
  const db = await getDb();

  if (key) {
    return NextResponse.json((await db.collection("settings").findOne({ key })) ?? {});
  }

  const settings = await db.collection("settings").find({}).toArray();
  return NextResponse.json(settings.map(({ _id, ...setting }) => ({ id: _id.toString(), ...setting })));
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const key = String(body.key || "");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("settings").updateOne(
    { key },
    { $set: { ...body, key, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
