import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { getDb } from "./mongodb";

const otpCollectionName = "adminLoginOtps";
const otpLifetimeMs = 10 * 60 * 1000;
const maxOtpAttempts = 5;
const resendCooldownMs = 60 * 1000;

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Missing NEXTAUTH_SECRET environment variable.");
  return secret;
}

function digestOtp(email: string, otp: string) {
  return createHmac("sha256", getSecret()).update(`${email}:${otp}`).digest("hex");
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createAdminOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function storeAdminOtp(email: string, otp: string) {
  const now = new Date();
  const cooldownBoundary = new Date(now.getTime() - resendCooldownMs);
  const db = await getDb();

  try {
    const result = await db.collection(otpCollectionName).updateOne(
      {
        _id: email,
        $or: [
          { requestedAt: { $lte: cooldownBoundary } },
          { requestedAt: { $exists: false } }
        ]
      },
      {
        $set: {
          codeHash: digestOtp(email, otp),
          requestedAt: now,
          expiresAt: new Date(now.getTime() + otpLifetimeMs),
          attempts: 0
        },
        $unset: { consumedAt: "" }
      },
      { upsert: true }
    );

    return result.matchedCount === 1 || result.upsertedCount === 1;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return false;
    }
    throw error;
  }
}

export async function invalidateAdminOtp(email: string) {
  const db = await getDb();
  await db.collection(otpCollectionName).updateOne(
    { _id: email },
    {
      $set: { expiresAt: new Date(), consumedAt: new Date() },
      $unset: { requestedAt: "" }
    }
  );
}

export async function consumeAdminOtp(email: string, otp: string) {
  if (!/^\d{6}$/.test(otp)) return false;

  const db = await getDb();
  const collection = db.collection(otpCollectionName);
  const now = new Date();
  const record = await collection.findOne({
    _id: email,
    expiresAt: { $gt: now },
    consumedAt: { $exists: false },
    attempts: { $lt: maxOtpAttempts }
  });

  if (!record || typeof record.codeHash !== "string") return false;

  const expected = Buffer.from(record.codeHash, "hex");
  const actual = Buffer.from(digestOtp(email, otp), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await collection.updateOne(
      {
        _id: email,
        codeHash: record.codeHash,
        expiresAt: { $gt: now },
        consumedAt: { $exists: false },
        attempts: { $lt: maxOtpAttempts }
      },
      { $inc: { attempts: 1 } }
    );
    return false;
  }

  const consumed = await collection.updateOne(
    {
      _id: email,
      codeHash: record.codeHash,
      expiresAt: { $gt: now },
      consumedAt: { $exists: false },
      attempts: { $lt: maxOtpAttempts }
    },
    { $set: { consumedAt: now } }
  );

  return consumed.modifiedCount === 1;
}

export const adminOtpLifetimeMinutes = otpLifetimeMs / 60_000;
