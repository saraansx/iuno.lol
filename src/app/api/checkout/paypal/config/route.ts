import { NextResponse } from "next/server";
import { getPaypalClientId, paypalConfigured, paypalEnv } from "@/lib/payments/paypal";

// Public config the browser needs to load the PayPal JS SDK (the client id is a
// public value — it ships in the SDK URL). No secret is exposed here.
export async function GET() {
  if (!paypalConfigured()) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    clientId: getPaypalClientId(),
    env: paypalEnv(),
  });
}
