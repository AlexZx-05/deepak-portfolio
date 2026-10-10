import { NextResponse, type NextRequest } from "next/server";
import {
  adminOtpLifetimeMinutes,
  createAdminOtp,
  invalidateAdminOtp,
  normalizeAdminEmail,
  storeAdminOtp
} from "../../../../../lib/adminOtp";

export async function POST(request: NextRequest) {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ADMIN_OTP_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!configuredEmail || !apiKey) {
    return NextResponse.json(
      { error: "Admin email sign-in is not configured. Set ADMIN_EMAIL and RESEND_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  const email = normalizeAdminEmail(configuredEmail);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter the admin email address to request a sign-in code." }, { status: 400 });
  }
  const requestedEmail = body && typeof body === "object" && "email" in body && typeof body.email === "string"
    ? normalizeAdminEmail(body.email)
    : "";
  if (!requestedEmail || requestedEmail !== email) {
    return NextResponse.json({ error: "Use the admin email configured for this site." }, { status: 400 });
  }

  const otp = createAdminOtp();
  const stored = await storeAdminOtp(email, otp);
  if (!stored) {
    return NextResponse.json(
      { error: "A sign-in code was already sent recently. Wait one minute before requesting another." },
      { status: 429 }
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [configuredEmail],
        subject: "Your portfolio admin sign-in code",
        text: `Your admin sign-in code is ${otp}.\n\nIt expires in ${adminOtpLifetimeMinutes} minutes and can only be used once. If you did not request this code, you can ignore this email.`
      }),
      signal: AbortSignal.timeout(10_000)
    });
  } catch (error) {
    console.error("Could not reach the admin OTP email service:", error);
    await invalidateAdminOtp(email);
    return NextResponse.json({ error: "Could not send the sign-in code. Check your email service configuration and try again." }, { status: 502 });
  }

  if (!response.ok) {
    console.error(`Admin OTP email delivery failed with status ${response.status}.`);
    await invalidateAdminOtp(email);
    return NextResponse.json(
      { error: "Email delivery failed. Check your Resend sender configuration and try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "If this is the configured admin email, a sign-in code has been sent." });
}
