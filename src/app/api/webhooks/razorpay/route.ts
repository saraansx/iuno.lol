import { NextRequest, NextResponse } from "next/server";
import { fulfillRazorpayOrder } from "@/lib/payments/fulfill";
import { verifyRazorpayWebhook, type RazorpayOrder } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!verifyRazorpayWebhook(body, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: { order?: { entity?: RazorpayOrder }; payment?: { entity?: { id?: string } } };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.event !== "order.paid") return NextResponse.json({ received: true });

  const order = event.payload?.order?.entity;
  const paymentId = event.payload?.payment?.entity?.id;
  if (!order || !paymentId) {
    console.error("[webhooks/razorpay] order.paid without order or payment entity");
    return NextResponse.json({ received: true });
  }

  try {
    if (!(await fulfillRazorpayOrder(order, paymentId))) {
      console.error(`[webhooks/razorpay] order ${order.id} doesn't match a plan; not fulfilled`);
    }
  } catch (err) {
    console.error("[webhooks/razorpay] failed to process event:", err);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
