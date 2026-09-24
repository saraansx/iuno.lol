import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { PREMIUM_PLAN } from "@/lib/payments/plans";
import { capturePaypalOrder } from "@/lib/payments/paypal";
import { notifyPremiumPurchase } from "@/lib/notify/discord";

// Captures an approved PayPal order and upgrades the account to Premium. The
// capture is done server-side (the browser only hands us an order id), and we
// confirm the money actually moved (status COMPLETED), that the order was ours
// (custom_id === userId), and that the amount matches the USD plan before
// flipping is_premium — defence-in-depth against a replayed/forged order id.
const bodySchema = z.object({ orderId: z.string().min(1).max(64) });

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const capture = await capturePaypalOrder(parsed.data.orderId);
  const expected = (PREMIUM_PLAN.USD.amount / 100).toFixed(2);
  if (
    !capture ||
    capture.status !== "COMPLETED" ||
    capture.customId !== String(userId) ||
    capture.currency !== "USD" ||
    capture.value !== expected
  ) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    // Lifetime plan: set the flag, leave premium_expires_at null (no expiry).
    await db.update(schema.users).set({ isPremium: true }).where(eq(schema.users.id, userId));
  } catch (err) {
    console.error("[checkout/paypal/capture] failed to upgrade user:", err);
    return NextResponse.json(
      { error: "Payment succeeded but we couldn't update your account. Contact support." },
      { status: 500 },
    );
  }

  // Best-effort Discord notification — never blocks or fails the upgrade.
  try {
    const [row] = await db
      .select({ username: schema.users.username, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    await notifyPremiumPurchase({
      gateway: "paypal",
      userId,
      username: row?.username,
      email: row?.email,
      amount: `${PREMIUM_PLAN.USD.symbol}${PREMIUM_PLAN.USD.display}`,
      currency: "USD",
    });
  } catch (err) {
    console.error("[checkout/paypal/capture] notify failed:", err);
  }

  return NextResponse.json({ success: true });
}
