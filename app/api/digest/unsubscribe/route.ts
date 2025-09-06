import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${
          process.env.APP_URL || "https://www.closedcompanies.site"
        }/digest/cancelled?error=missing_token`
      );
    }

    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      return NextResponse.redirect(
        `${
          process.env.APP_URL || "https://www.closedcompanies.site"
        }/digest/cancelled?error=invalid_token`
      );
    }

    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.redirect(
      `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/digest/unsubscribed`
    );
  } catch (error) {
    console.error("Digest unsubscribe error:", error);
    return NextResponse.redirect(
      `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/digest/cancelled?error=unsubscribe_failed`
    );
  }
}
