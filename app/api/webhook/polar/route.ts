import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import { PolarWebhookPayload } from "@/lib/polar";

export async function POST(request: Request) {
  try {
    await connectDB();

    const payload: PolarWebhookPayload = await request.json();

    console.log("=== POLAR WEBHOOK RECEIVED ===");
    console.log("Payload type:", payload.type);
    // Payload details logged in development only
    if (process.env.NODE_ENV === 'development') {
      console.log("Full payload:", JSON.stringify(payload, null, 2));
    }

    switch (payload.type) {
      case "checkout.completed":
      case "payment.succeeded": {
        const customerEmail = payload.data.checkout_session?.customer_email;
        const productId = payload.data.checkout_session?.product_id;

        console.log("Processing payment webhook");
        // Email and product details logged in development only
        if (process.env.NODE_ENV === 'development') {
          console.log("- Customer email:", customerEmail);
          console.log("- Product ID:", productId);
          console.log("- Expected product ID:", process.env.POLAR_PRODUCT_ID);
        }

        if (!customerEmail || productId !== process.env.POLAR_PRODUCT_ID) {
          console.warn("Invalid webhook data - email or product ID mismatch");
          return NextResponse.json({ ok: false }, { status: 400 });
        }

        // Activate customer subscription
        const updatedCustomer = await Customer.findOneAndUpdate(
          { email: customerEmail.toLowerCase() },
          {
            subscriptionStatus: "active",
            lastPaymentAt: new Date(),
            subscriptionId: payload.data.checkout_session?.id,
          },
          { new: true, upsert: true }
        );

        if (!updatedCustomer) {
          console.warn("❌ Could not find or create customer");
          // Create customer if they don't exist (fallback)
          await Customer.create({
            email: customerEmail.toLowerCase(),
            subscriptionStatus: "active",
            lastPaymentAt: new Date(),
            subscriptionId: payload.data.checkout_session?.id,
            plan: "weekly_digest", // default plan
          });
          console.log("✅ Created new customer");
        } else {
          console.log("✅ Activated subscription successfully");
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const customerEmail = payload.data.subscription?.customer_email;

        if (!customerEmail) {
          console.warn("Invalid subscription webhook data:", payload);
          return NextResponse.json({ ok: false }, { status: 400 });
        }

        // Cancel customer subscription
        await Customer.findOneAndUpdate(
          { email: customerEmail.toLowerCase() },
          {
            subscriptionStatus: "cancelled",
          }
        );

        console.log("Cancelled subscription");
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
