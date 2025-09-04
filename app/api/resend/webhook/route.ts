import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/Subscriber";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");
    
    // Resend sends signature in format: sha256=<hash>
    const actualSignature = signature.replace("sha256=", "");
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(actualSignature, "hex")
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("resend-signature");
    
    // Verify webhook signature for security
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("Webhook signature verification skipped - missing secret or signature");
    }

    const data = JSON.parse(body);
    console.log("Resend webhook received:", data);

    await connectDB();

    // Handle different webhook types
    switch (data.type) {
      case "email.bounced":
        await handleBounce(data.data);
        break;
      case "email.complained":
        await handleComplaint(data.data);
        break;
      case "email.delivered":
        // Optional: track successful deliveries
        console.log(`Email delivered successfully to ${data.data.to}`);
        break;
      default:
        console.log(`Unhandled webhook type: ${data.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function handleBounce(data: any) {
  const email = data.to;
  console.log(`Email bounced for: ${email}`);
  
  // Mark subscriber as bounced
  await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { 
      bounced: true,
      bouncedAt: new Date(),
      unsubscribedAt: new Date(), // Also unsubscribe them
    }
  );
}

async function handleComplaint(data: any) {
  const email = data.to;
  console.log(`Spam complaint for: ${email}`);
  
  // Mark as complained and immediately unsubscribe
  await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { 
      complained: true,
      complainedAt: new Date(),
      unsubscribedAt: new Date(),
    }
  );
}
