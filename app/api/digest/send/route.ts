import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import Customer from "@/lib/models/Customer";
import { sendDigestEmail } from "@/lib/digestEmail";
import { sendLimiter } from "@/lib/rateLimiter";

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  return ip;
}

// Get 4-5 random startups with preference for recent shutdowns and diverse industries
async function selectStartupsForDigest(): Promise<any[]> {
  const total = await Startup.countDocuments({});
  if (total < 5) {
    return Startup.find({}).limit(5).lean();
  }

  // Get a mix: 2 recent (last 3 years), 2 older, 1 random
  const currentYear = new Date().getFullYear();
  const recent = await Startup.find({
    shutDown: { $gte: currentYear - 3 },
  })
    .limit(10)
    .lean();

  const older = await Startup.find({
    shutDown: { $lt: currentYear - 3 },
  })
    .limit(10)
    .lean();

  // Shuffle and pick
  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const recentShuffled = shuffleArray(recent);
  const olderShuffled = shuffleArray(older);

  const selected = [
    ...recentShuffled.slice(0, 2),
    ...olderShuffled.slice(0, 2),
  ];

  // Add one more random if we have space
  if (selected.length < 5 && total > 4) {
    const randomSkip = Math.floor(Math.random() * total);
    const randomStartup = await Startup.findOne({}).skip(randomSkip).lean();
    if (randomStartup && !selected.find((s) => s.id === randomStartup.id)) {
      selected.push(randomStartup);
    }
  }

  return selected.slice(0, 5);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const check = await sendLimiter.check(ip);
  if (!check.allowed) {
    const res = NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
    res.headers.set("Retry-After", Math.ceil(check.resetMs / 1000).toString());
    return res;
  }

  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const expected =
      process.env.DIGEST_CRON_SECRET ||
      process.env.NEWSLETTER_CRON_SECRET ||
      "";
    if (!expected || token !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get active paid customers
    const activeCustomers = await Customer.find({
      subscriptionStatus: "active",
    }).lean();

    if (activeCustomers.length === 0) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        message: "No active customers",
      });
    }

    // Select startups for this week's digest
    const selectedStartups = await selectStartupsForDigest();
    if (selectedStartups.length === 0) {
      return NextResponse.json({ error: "No startups found" }, { status: 500 });
    }

    let sent = 0;
    let failed = 0;

    // Send to all active customers
    await Promise.all(
      activeCustomers.map(async (customer) => {
        try {
          const unsubscribeUrl = `${
            process.env.APP_URL || "http://localhost:3000"
          }/api/digest/unsubscribe?token=${encodeURIComponent(
            customer.unsubscribeToken
          )}`;

          await sendDigestEmail({
            to: customer.email,
            startups: selectedStartups,
            unsubscribeUrl,
          });

          // Update last sent timestamp
          await Customer.findByIdAndUpdate(customer._id, {
            lastDigestSentAt: new Date(),
          });

          sent += 1;
        } catch (e) {
          console.error("Failed to send digest to", customer.email, e);
          failed += 1;
        }
      })
    );

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      startups: selectedStartups.length,
      companies: selectedStartups.map((s) => s.name),
    });
  } catch (error) {
    console.error("Send digest error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
