import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const messages = await db.collection("messages").find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(messages.map(({ _id, ...message }) => ({ id: _id.toString(), ...message })));
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const db = await getDb();
  await db.collection("messages").updateOne(
    { _id: new ObjectId(String(body.id)) },
    { $set: { read: Boolean(body.read), updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("messages").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
