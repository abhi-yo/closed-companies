import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import { subscribeLimiter } from "@/lib/rateLimiter";
import { createCheckoutSession } from "@/lib/polar";

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  return ip;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const check = await subscribeLimiter.check(ip);
  if (!check.allowed) {
    const res = NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
    res.headers.set("Retry-After", Math.ceil(check.resetMs / 1000).toString());
    return res;
  }

  try {
    await connectDB();
    const { email, name, plan = "monthly" } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(24).toString("hex");

    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      // If customer exists but not active, create new checkout
      if (existing.subscriptionStatus !== "active") {
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        const checkoutSession = await createCheckoutSession({
          customerEmail: normalizedEmail,
          successUrl: `${appUrl}/digest/success?email=${encodeURIComponent(
            normalizedEmail
          )}`,
          cancelUrl: `${appUrl}/digest/cancelled`,
        });

        return NextResponse.json({
          ok: true,
          checkoutUrl: checkoutSession.url,
          sessionId: checkoutSession.id,
        });
      }

      return NextResponse.json({
        exists: true,
        status: existing.subscriptionStatus,
        message: "Already subscribed",
      });
    }

    // Create inactive customer (will be activated after payment)
    const customer = await Customer.create({
      email: normalizedEmail,
      name: name?.trim(),
      plan,
      subscriptionStatus: "inactive",
      unsubscribeToken: token,
      sourceIp: ip,
    });

    // Create Polar checkout session
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      customerEmail: normalizedEmail,
      successUrl: `${appUrl}/digest/success?email=${encodeURIComponent(
        normalizedEmail
      )}`,
      cancelUrl: `${appUrl}/digest/cancelled`,
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Digest subscribe error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
