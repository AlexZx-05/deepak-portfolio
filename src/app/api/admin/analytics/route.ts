import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const [totalVisits, topSections, countries] = await Promise.all([
    db.collection("analytics").countDocuments({ section: "page" }),
    db.collection("analytics").aggregate([
      { $match: { section: { $ne: "page" } } },
      { $group: { _id: "$section", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray(),
    db.collection("analytics").aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray()
  ]);

  return NextResponse.json({
    totalVisits,
    topSections: topSections.map((item) => ({ name: item._id || "Unknown", count: item.count })),
    countries: countries.map((item) => ({ name: item._id || "Unknown", count: item.count }))
  });
}
