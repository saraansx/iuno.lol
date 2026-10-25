import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { BADGE_ROLE_MAP } from "@/lib/badge-roles";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { fieldsForPlan, getPlan, isCurrency, type Currency, type Plan } from "@/lib/payments/plans";
import { processPaymentEventOnce } from "@/lib/payments/idempotency";
import { notifyPremiumPurchase } from "@/lib/notify/discord";
import type { RazorpayOrder } from "@/lib/payments/razorpay";

export async function fulfillRazorpayOrder(order: RazorpayOrder, paymentId: string): Promise<boolean> {
  const plan = getPlan(order.notes?.plan);
  const userId = Number(order.notes?.userId);
  if (!plan || !Number.isInteger(userId) || userId <= 0) return false;
  if (!isCurrency(order.currency)) return false;
  const price = plan.prices[order.currency as Currency];
  if (order.amount !== price.amount || order.status !== "paid") return false;

  const processed = await processPaymentEventOnce(
    { provider: "razorpay", eventId: paymentId, userId, plan: plan.tag },
    async (tx) => {
      await tx.update(schema.users).set(fieldsForPlan(plan)).where(eq(schema.users.id, userId));
    },
  );
  if (!processed) return true;
  await grantPlanPerks(userId, plan);

  try {
    const [row] = await db
      .select({ username: schema.users.username, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    await notifyPremiumPurchase({
      gateway: "razorpay",
      product: plan.name,
      userId,
      username: row?.username,
      email: row?.email,
      amount: `${price.symbol}${price.display}`,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[payments] razorpay notify failed:", err);
  }
  return true;
}

export async function grantPlanPerks(userId: number, plan: Plan): Promise<void> {
  const badgeId = plan.badgeId;
  if (badgeId) {
    try {
      await db
        .insert(schema.userBadges)
        .values({ userId, badgeId, equipped: false, equippedAt: null })
        .onDuplicateKeyUpdate({ set: { badgeId } });
    } catch (err) {
      console.error(`[payments] badge grant (${badgeId}) failed:`, err);
    }
  }

  const [user] = await db
    .select({ username: schema.users.username, discordId: schema.users.discordId })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const roleId = badgeId ? BADGE_ROLE_MAP[badgeId] : undefined;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (user?.discordId && roleId && botToken && guildId) {
    try {
      await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${user.discordId}/roles/${roleId}`, {
        method: "PUT",
        headers: { Authorization: `Bot ${botToken}` },
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      console.error(`[payments] discord role (${badgeId}) failed:`, err);
    }
  }

  if (user?.username) await purgeCloudflareProfileCache(user.username);
}
