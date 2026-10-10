import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "../../../../lib/adminApi";

const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Image upload is not configured. Add the Cloudinary credentials to .env.local and restart the app." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const context = formData.get("context");

  if (context !== null && context !== "site") {
    return NextResponse.json({ error: "Invalid image upload context." }, { status: 400 });
  }

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (!allowedImageTypes.has(image.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  }

  if (image.size === 0 || image.size > maxImageSize) {
    return NextResponse.json({ error: "Image must be between 1 byte and 5 MB." }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = context === "site" ? "portfolio/site" : "portfolio/projects";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  const uploadData = new FormData();

  uploadData.append("file", image);
  uploadData.append("api_key", apiKey);
  uploadData.append("timestamp", String(timestamp));
  uploadData.append("signature", signature);
  uploadData.append("folder", folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadData
    });

    if (!response.ok) {
      console.error("Cloudinary project image upload failed with status:", response.status);
      return NextResponse.json({ error: "Image upload service rejected the image. Please try again." }, { status: 502 });
    }

    const uploadedImage = await response.json() as { secure_url?: string };
    if (!uploadedImage.secure_url) {
      console.error("Cloudinary project image upload returned no secure URL.");
      return NextResponse.json({ error: "Image upload service returned an invalid response." }, { status: 502 });
    }

    return NextResponse.json({ url: uploadedImage.secure_url });
  } catch (error) {
    console.error("Cloudinary project image upload request failed:", error);
    return NextResponse.json({ error: "Could not reach the image upload service." }, { status: 502 });
  }
}
