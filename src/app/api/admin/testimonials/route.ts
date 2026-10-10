import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

const testimonialStatuses = new Set(["pending", "approved", "rejected"]);

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const testimonials = await db.collection("testimonials").find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(testimonials.map(({ _id, ...testimonial }) => ({ id: _id.toString(), ...testimonial })));
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit a valid moderation update." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Submit a valid moderation update." }, { status: 400 });
  }

  const update = body as Record<string, unknown>;
  const id = String(update.id || "");
  const status = String(update.status || "");
  if (!ObjectId.isValid(id) || !testimonialStatuses.has(status)) {
    return NextResponse.json({ error: "A valid testimonial and status are required." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("testimonials").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );

  if (!result.matchedCount) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id") || "";
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "A valid testimonial id is required." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("testimonials").deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
