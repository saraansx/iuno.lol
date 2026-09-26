import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";

// Lightweight poll target for the checkout page. After the Tebex embedded
// checkout reports payment completion, the browser polls here until the webhook
// has flipped is_premium server-side, then shows the success screen. Reports
// only the boolean — no payment data crosses the browser.
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ premium: false }, { status: 401 });
  }
  const user = await getUserById(userId);
  return NextResponse.json({ premium: Boolean(user?.isPremium) });
}
