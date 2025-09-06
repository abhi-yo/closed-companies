import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import NewsletterSubscriber from "@/lib/models/Subscriber";
import { renderNewsletterHTML, sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    
    // Verify the secret to prevent unauthorized access
    if (secret !== process.env.NEWSLETTER_CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const activeSubscribers = await NewsletterSubscriber.find({
      unsubscribedAt: null,
      verified: true,
      bounced: { $ne: true }, // Exclude bounced emails
      complained: { $ne: true }, // Exclude emails that complained
    }).lean();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({ 
        message: "No active verified subscribers found" 
      });
    }

    // Get a random startup
    const total = await Startup.countDocuments({});
    const rand = Math.floor(Math.random() * total);
    const [randomStartup] = await Startup.find({}).skip(rand).limit(1).lean();
    
    if (!randomStartup) {
      return NextResponse.json(
        { error: "No startup found" }, 
        { status: 404 }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const sub of activeSubscribers) {
      const unsubscribeUrl = `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/api/newsletter/unsubscribe?token=${encodeURIComponent(
        sub.unsubscribeToken
      )}`;
      
      const html = renderNewsletterHTML(randomStartup as any, unsubscribeUrl);
      
      try {
        await sendEmail({
          to: sub.email,
          subject: `Closed Companies — ${randomStartup.name} (${randomStartup.shutDown})`,
          html,
          listUnsubscribe: unsubscribeUrl,
        });
        
        // Track that we sent an email to this subscriber
        await NewsletterSubscriber.findOneAndUpdate(
          { email: sub.email },
          { 
            $inc: { emailsSent: 1 },
            lastEmailSent: new Date(),
          }
        );
        
        sent += 1;
      } catch (e) {
        console.error("Failed to send to", sub.email, e);
        failed += 1;
      }

      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      startup: randomStartup.name,
      sent,
      failed,
      total: activeSubscribers.length,
    });

  } catch (error) {
    console.error("Newsletter send error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
