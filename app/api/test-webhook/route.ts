import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Simulate a Polar webhook payload
    const webhookPayload = {
      type: "payment.succeeded",
      data: {
        checkout_session: {
          id: "test_session_" + Date.now(),
          status: "completed",
          customer_email: email,
          product_id: process.env.POLAR_PRODUCT_ID,
        }
      }
    };

    console.log("Sending test webhook payload:", webhookPayload);

    // Call our webhook endpoint
    const response = await fetch(`${process.env.APP_URL || "http://localhost:3000"}/api/polar/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: result,
      webhookPayload,
    });

  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
