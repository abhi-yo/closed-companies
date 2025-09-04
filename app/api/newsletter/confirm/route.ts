import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/Subscriber";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(
        new URL("/newsletter/confirmed?error=missing", request.url)
      );
    }
    const sub = await NewsletterSubscriber.findOne({
      verificationToken: token,
    });
    if (!sub) {
      return NextResponse.redirect(
        new URL("/newsletter/confirmed?error=invalid", request.url)
      );
    }
    sub.verified = true;
    sub.verifiedAt = new Date();
    sub.verificationToken = null;
    await sub.save();
    return NextResponse.redirect(
      new URL("/newsletter/confirmed?ok=1", request.url)
    );
  } catch (error) {
    console.error("Confirm error", error);
    return NextResponse.redirect(
      new URL("/newsletter/confirmed?error=server", request.url)
    );
  }
}


