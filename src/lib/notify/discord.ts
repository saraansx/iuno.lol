
type Gateway = "razorpay" | "polar";

function webhookFor(gateway: Gateway): string | undefined {
  if (gateway === "razorpay") return process.env.DISCORD_WEBHOOK_RAZORPAY;
  return process.env.DISCORD_WEBHOOK_POLAR;
}

interface PurchaseNotification {
  gateway: Gateway;
  product?: string;
  userId: number | string;
  username?: string | null;
  email?: string | null;
  amount: string;
  currency: string;
}

export async function notifyPremiumPurchase(n: PurchaseNotification): Promise<void> {
  const url = webhookFor(n.gateway);
  if (!url) return;

  const profile = n.username ? `iuno.lol/${n.username}` : `user #${n.userId}`;
  const body = {
    username: "iuno.lol payments",
    embeds: [
      {
        title: `New ${n.product ?? "Premium"} purchase`,
        color: 0x5b6cf5,
        fields: [
          { name: "User", value: profile, inline: true },
          { name: "Amount", value: `${n.amount} ${n.currency}`, inline: true },
          { name: "Gateway", value: n.gateway === "razorpay" ? "Razorpay" : "Polar (Card)", inline: true },
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
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`[notify] Discord webhook (${n.gateway}) failed:`, err);
  }
}
