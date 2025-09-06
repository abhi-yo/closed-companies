import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { subscribeLimiter } from "@/lib/rateLimiter";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

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
    const { email, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(24).toString("hex");
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.unsubscribedAt) {
        existing.unsubscribedAt = null;
      }
      existing.verified = false;
      existing.verificationToken = verificationToken;
      existing.unsubscribeToken = token;
      existing.sourceIp = ip;
      await existing.save();

      const confirmUrl = `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/api/digest/confirm?token=${encodeURIComponent(verificationToken)}`;
      await sendEmail({
        to: normalizedEmail,
        subject: "Confirm your subscription to Closed Companies Digest",
        html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111"><h2>Confirm your subscription</h2><p>Click the button below to confirm your subscription to Closed Companies Digest.</p><p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:8px">Confirm subscription</a></p><p>If the button doesn't work, copy and paste this URL:<br/>${confirmUrl}</p></div>`,
      });
      return NextResponse.json({ ok: true });
    }

    await Subscriber.create({
      email: normalizedEmail,
      unsubscribeToken: token,
      verified: false,
      verificationToken,
      sourceIp: ip,
    });

    const confirmUrl = `${
      process.env.APP_URL || "https://www.closedcompanies.site"
    }/api/digest/confirm?token=${encodeURIComponent(verificationToken)}`;
    await sendEmail({
      to: normalizedEmail,
      subject: "Confirm your subscription to Closed Companies Digest",
      html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111"><h2>Confirm your subscription</h2><p>Click the button below to confirm your subscription to Closed Companies Digest.</p><p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:8px">Confirm subscription</a></p><p>If the button doesn't work, copy and paste this URL:<br/>${confirmUrl}</p></div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Digest subscription error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
