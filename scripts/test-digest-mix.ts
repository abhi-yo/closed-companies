import "dotenv/config";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import Subscriber from "@/lib/models/Subscriber";
import { sendDigestEmail } from "@/lib/digestEmail";

// Get mix of startups: 1 old, 1 new, 1 random
async function selectStartupsForDigest(): Promise<any[]> {
  const currentYear = new Date().getFullYear();

  // Get 1 recent startup (last 3 years)
  const recent = await Startup.find({
    shutDown: { $gte: currentYear - 3 },
  })
    .limit(5)
    .lean();

  // Get 1 older startup (more than 3 years ago)
  const older = await Startup.find({
    shutDown: { $lt: currentYear - 3 },
  })
    .limit(5)
    .lean();

  // Get 1 random startup
  const total = await Startup.countDocuments({});
  const randomSkip = Math.floor(Math.random() * total);
  const randomStartup = await Startup.findOne({}).skip(randomSkip).lean();

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
    ...recentShuffled.slice(0, 1), // 1 new
    ...olderShuffled.slice(0, 1), // 1 old
    ...(randomStartup ? [randomStartup] : []), // 1 random
  ];

  return selected.slice(0, 3);
}

async function testDigestEmail() {
  await connectDB();

  const testEmail = "akshatsing11@gmail.com";

  console.log("Testing digest email for:", testEmail);

  // Check subscriber
  const subscriber = await Subscriber.findOne({
    email: testEmail.toLowerCase(),
  });
  if (!subscriber) {
    console.error("Subscriber not found");
    return;
  }

  console.log("Subscriber found:", {
    email: subscriber.email,
    verified: subscriber.verified,
    lastEmail: subscriber.lastEmailSent,
  });

  // Get mix of startups
  const selectedStartups = await selectStartupsForDigest();
  if (selectedStartups.length === 0) {
    console.error("No startups found");
    return;
  }

  console.log("Selected startups mix:");
  selectedStartups.forEach((startup, index) => {
    const currentYear = new Date().getFullYear();
    const isRecent = startup.shutDown >= currentYear - 3;
    const type = isRecent ? "NEW" : "OLD";
    console.log(
      `${index + 1}. ${startup.name} (${startup.shutDown}) - ${type}`
    );
  });

  const unsubscribeUrl = `${
    process.env.APP_URL || "https://www.closedcompanies.site"
  }/api/digest/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribeToken
  )}`;

  console.log("Sending digest email...");

  try {
    const result = await sendDigestEmail({
      to: subscriber.email,
      startups: selectedStartups as any,
      unsubscribeUrl,
    });

    console.log("✅ Digest email sent successfully!");
    console.log("Resend response:", result);

    // Update timestamp
    await Subscriber.findByIdAndUpdate(subscriber._id, {
      lastEmailSent: new Date(),
      $inc: { emailsSent: 1 },
    });
  } catch (error: any) {
    console.error("❌ Failed to send digest email:");
    console.error(error);

    if (error?.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testDigestEmail()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
