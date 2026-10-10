import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function GET() {
  const db = await getDb();
  const resume = await db.collection("resumes").findOne({ latest: true });

  if (!resume?.data) {
    if (resume?.url) {
      await db.collection("resumes").updateOne({ _id: resume._id }, { $inc: { downloadCount: 1 } });
      return NextResponse.redirect(resume.url);
    }

    return NextResponse.json({ error: "Resume not uploaded yet" }, { status: 404 });
  }

  await db.collection("resumes").updateOne({ _id: resume._id }, { $inc: { downloadCount: 1 } });

  return new NextResponse(resume.data.buffer, {
    headers: {
      "Content-Type": resume.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.filename || "resume.pdf"}"`
    }
  });
}
