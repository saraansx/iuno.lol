// Server-only Discord webhook notifications for Premium purchases. Reads
// DISCORD_WEBHOOK_RAZORPAY / DISCORD_WEBHOOK_PAYPAL, so this module must never be
// imported into a client component — only into route handlers / server code.
//
// Notifications are best-effort: a webhook failure must NEVER block or fail the
// purchase (the user is already Premium by the time we call this), so every call
// is wrapped and errors are only logged.

type Gateway = "razorpay" | "paypal" | "polar" | "tebex";

function webhookFor(gateway: Gateway): string | undefined {
  if (gateway === "razorpay") return process.env.DISCORD_WEBHOOK_RAZORPAY;
  if (gateway === "polar") return process.env.DISCORD_WEBHOOK_POLAR ?? process.env.DISCORD_WEBHOOK_PAYPAL;
  if (gateway === "tebex") return process.env.DISCORD_WEBHOOK_TEBEX ?? process.env.DISCORD_WEBHOOK_PAYPAL;
  return process.env.DISCORD_WEBHOOK_PAYPAL;
}

export interface PurchaseNotification {
  gateway: Gateway;
  userId: number | string;
  username?: string | null;
  email?: string | null;
  /** Human-readable price, e.g. "$1.10" or "₹1". */
  amount: string;
  currency: string;
}

/**
 * Post a "new Premium purchase" embed to the gateway's Discord webhook.
 * Best-effort and non-throwing — safe to `await` (or fire-and-forget) after the
 * account has already been upgraded.
 */
export async function notifyPremiumPurchase(n: PurchaseNotification): Promise<void> {
  const url = webhookFor(n.gateway);
  if (!url) return; // webhook not configured for this gateway — skip silently

  const profile = n.username ? `iuno.lol/${n.username}` : `user #${n.userId}`;
  const body = {
    username: "iuno.lol payments",
    embeds: [
      {
        title: "New Premium purchase",
        color: 0x5b6cf5,
        fields: [
          { name: "User", value: profile, inline: true },
          { name: "Amount", value: `${n.amount} ${n.currency}`, inline: true },
          { name: "Gateway", value: n.gateway === "razorpay" ? "Razorpay" : n.gateway === "polar" ? "Polar (Card)" : n.gateway === "tebex" ? "Tebex" : "PayPal", inline: true },
          ...(n.email ? [{ name: "Email", value: n.email, inline: false }] : []),
          { name: "User ID", value: String(n.userId), inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[notify] Discord webhook (${n.gateway}) failed:`, err);
  }
}
