import type { NextRequest } from "next/server";
import { deleteCollectionItem, listCollection, saveCollectionItem } from "../../../../lib/adminApi";

export async function GET() {
  return listCollection("projects");
}

export async function POST(request: NextRequest) {
  return saveCollectionItem(request, "projects");
}

export async function DELETE(request: NextRequest) {
  return deleteCollectionItem(request, "projects");
}
