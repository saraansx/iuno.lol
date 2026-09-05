import { createHmac, timingSafeEqual } from "crypto";

const secret = process.env.JWT_SECRET_KEY;
if (!secret) {
  throw new Error("JWT_SECRET_KEY is not set. Widget image URLs cannot be signed without it.");
}

const signingKey = createHmac("sha256", secret).update("widget-image-proxy.v1").digest();

const SIGNATURE_LENGTH = 24;

export function signWidgetImageUrl(url: string): string {
  return createHmac("sha256", signingKey).update(url).digest("hex").slice(0, SIGNATURE_LENGTH);
}

export function verifyWidgetImageUrl(url: string, signature: string | null | undefined): boolean {
  if (!signature || signature.length !== SIGNATURE_LENGTH) return false;

  const expected = Buffer.from(signWidgetImageUrl(url));
  const provided = Buffer.from(signature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
