import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(
        new URL("/digest/unsubscribed?error=missing", request.url)
      );
    }
    const customer = await Customer.findOne({ unsubscribeToken: token });
    if (!customer) {
      return NextResponse.redirect(
        new URL("/digest/unsubscribed?error=invalid", request.url)
      );
    }

    // Mark as cancelled but keep the customer record for billing
    customer.subscriptionStatus = "cancelled";
    await customer.save();

    return NextResponse.redirect(
      new URL("/digest/unsubscribed?ok=1", request.url)
    );
  } catch (error) {
    console.error("Unsubscribe error", error);
    return NextResponse.redirect(
      new URL("/digest/unsubscribed?error=server", request.url)
    );
  }
}
