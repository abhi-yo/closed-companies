import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

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

    const customer = await Customer.findOne({ email: normalizedEmail }).lean();
    console.log("Found customer:", customer);

    if (!customer) {
      return NextResponse.json({
        exists: false,
        status: null,
      });
    }

    return NextResponse.json({
      exists: true,
      status: customer.subscriptionStatus,
      subscribedAt: customer.subscribedAt,
    });
  } catch (error) {
    console.error("Check email error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
