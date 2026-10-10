import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "portfolio/resume";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  return response.json() as Promise<{ secure_url: string; public_id: string }>;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing resume PDF" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const db = await getDb();
  const cloudinary = await uploadToCloudinary(file);

  await db.collection("resumes").updateMany({}, { $set: { latest: false } });
  await db.collection("resumes").insertOne({
    filename: file.name,
    contentType: file.type || "application/pdf",
    data: cloudinary ? undefined : bytes,
    url: cloudinary?.secure_url,
    cloudinaryPublicId: cloudinary?.public_id,
    latest: true,
    downloadCount: 0,
    createdAt: new Date()
  });

  return NextResponse.json({ ok: true });
}
