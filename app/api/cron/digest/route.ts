import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.DIGEST_CRON_SECRET;
    
    if (!cronSecret) {
      console.error("DIGEST_CRON_SECRET not configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // For Vercel cron, we can check the user-agent or use a Bearer token
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕒 Automated digest cron job triggered");

    // Call the existing digest send endpoint
    const response = await fetch(`${process.env.APP_URL || "http://localhost:3000"}/api/digest/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cronSecret}`,
      },
    });

    const result = await response.json();
    
    console.log("✅ Digest cron job completed:", result);
    
    return NextResponse.json({
      success: true,
      message: "Digest sent via cron",
      ...result,
    });

  } catch (error) {
    console.error("❌ Digest cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
