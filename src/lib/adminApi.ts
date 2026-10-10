import { ObjectId } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getDb } from "./mongodb";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function listCollection(collectionName: string) {
  const db = await getDb();
  const docs = await db.collection(collectionName).find({}).sort({ order: 1, createdAt: -1 }).toArray();
  return NextResponse.json(docs.map(({ _id, ...doc }) => ({ id: _id.toString(), ...doc })));
}

export async function saveCollectionItem(request: NextRequest, collectionName: string) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body;
  const normalizedData = {
    ...data,
    order: data.order === "" || data.order === undefined ? 0 : Number(data.order),
    level: data.level === "" || data.level === undefined ? undefined : Number(data.level),
    featured: data.featured === true || data.featured === "on" || data.featured === "true",
    visible: data.visible === undefined ? true : data.visible === true || data.visible === "on" || data.visible === "true",
    tags: typeof data.tags === "string" ? data.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : data.tags
  };
  const db = await getDb();
  const now = new Date();

  if (id) {
    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...normalizedData, updatedAt: now } }
    );
    return NextResponse.json({ ok: true, id });
  }

  const result = await db.collection(collectionName).insertOne({ ...normalizedData, createdAt: now, updatedAt: now });
  return NextResponse.json({ ok: true, id: result.insertedId.toString() });
}

export async function deleteCollectionItem(request: NextRequest, collectionName: string) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
