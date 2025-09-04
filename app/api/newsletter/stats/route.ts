import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/Subscriber";

export async function GET() {
  try {
    await connectDB();

    const stats = await NewsletterSubscriber.aggregate([
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
          verifiedSubscribers: {
            $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] }
          },
          activeSubscribers: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ["$verified", true] },
                    { $eq: ["$unsubscribedAt", null] },
                    { $ne: ["$bounced", true] },
                    { $ne: ["$complained", true] }
                  ]
                }, 
                1, 
                0
              ]
            }
          },
          unsubscribed: {
            $sum: { $cond: [{ $ne: ["$unsubscribedAt", null] }, 1, 0] }
          },
          bounced: {
            $sum: { $cond: [{ $eq: ["$bounced", true] }, 1, 0] }
          },
          complained: {
            $sum: { $cond: [{ $eq: ["$complained", true] }, 1, 0] }
          },
          totalEmailsSent: { $sum: "$emailsSent" },
        }
      }
    ]);

    const recentSubscribers = await NewsletterSubscriber.find({
      verified: true,
      unsubscribedAt: null,
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('email createdAt emailsSent lastEmailSent')
    .lean();

    return NextResponse.json({
      stats: stats[0] || {
        totalSubscribers: 0,
        verifiedSubscribers: 0,
        activeSubscribers: 0,
        unsubscribed: 0,
        bounced: 0,
        complained: 0,
        totalEmailsSent: 0,
      },
      recentSubscribers,
    });

  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
