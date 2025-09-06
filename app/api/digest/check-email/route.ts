import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email } = await request.json();

    console.log("Checking email:", email);

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log("Normalized email:", normalizedEmail);

    const subscriber = await Subscriber.findOne({
      email: normalizedEmail,
    }).lean();
    console.log("Found subscriber:", subscriber);

    if (!subscriber) {
      return NextResponse.json({
        exists: false,
        verified: false,
      });
    }

    return NextResponse.json({
      exists: true,
      verified: subscriber.verified,
      subscribedAt: subscriber.createdAt,
    });
  } catch (error) {
    console.error("Check email error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
