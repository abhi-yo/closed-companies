import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.NEWSLETTER_CRON_SECRET;
    
    if (!cronSecret) {
      console.error("NEWSLETTER_CRON_SECRET not configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized newsletter cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕒 Automated newsletter cron job triggered");

    // Call the existing newsletter send endpoint
    const response = await fetch(`${process.env.APP_URL || "http://localhost:3000"}/api/newsletter/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secret: cronSecret }),
    });

    const result = await response.json();
    
    console.log("✅ Newsletter cron job completed:", result);
    
    return NextResponse.json({
      success: true,
      message: "Newsletter sent via cron",
      ...result,
    });

  } catch (error) {
    console.error("❌ Newsletter cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
