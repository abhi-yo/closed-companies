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
        new URL("/newsletter/unsubscribed?error=missing", request.url)
      );
    }
    const sub = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
    if (!sub) {
      return NextResponse.redirect(
        new URL("/newsletter/unsubscribed?error=invalid", request.url)
      );
    }
    sub.unsubscribedAt = new Date();
    await sub.save();
    return NextResponse.redirect(
      new URL("/newsletter/unsubscribed?ok=1", request.url)
    );
  } catch (error) {
    console.error("Unsubscribe error", error);
    return NextResponse.redirect(
      new URL("/newsletter/unsubscribed?error=server", request.url)
    );
  }
}
