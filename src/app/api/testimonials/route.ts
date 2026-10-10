import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "../../../lib/mongodb";

const maxNameLength = 80;
const maxRoleLength = 100;
const maxContentLength = 1200;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit a valid testimonial." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Submit a valid testimonial." }, { status: 400 });
  }

  const testimonial = body as Record<string, unknown>;
  if (typeof testimonial.website === "string" && testimonial.website.trim()) {
    return NextResponse.json({ error: "Unable to submit testimonial." }, { status: 400 });
  }

  const name = typeof testimonial.name === "string" ? testimonial.name.trim() : "";
  const role = typeof testimonial.role === "string" ? testimonial.role.trim() : "";
  const content = typeof testimonial.content === "string" ? testimonial.content.trim() : "";
  const rating = Number(testimonial.rating);

  if (name.length < 2 || name.length > maxNameLength) {
    return NextResponse.json({ error: "Name must be between 2 and 80 characters." }, { status: 400 });
  }

  if (role.length > maxRoleLength) {
    return NextResponse.json({ error: "Role or company must be 100 characters or fewer." }, { status: 400 });
  }

  if (content.length < 20 || content.length > maxContentLength) {
    return NextResponse.json({ error: "Testimonial must be between 20 and 1,200 characters." }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("testimonials").insertOne({
    name,
    role,
    content,
    rating,
    status: "pending",
    createdAt: new Date()
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
