import "dotenv/config";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import Subscriber from "@/lib/models/Subscriber";
import { sendDigestEmail } from "@/lib/digestEmail";

// Get 4-5 random startups for the digest
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

async function main() {
  await connectDB();

  const verifiedSubscribers = await Subscriber.find({
    verified: true,
    unsubscribedAt: null,
  }).lean();

  if (verifiedSubscribers.length === 0) {
    console.log("No verified subscribers");
    return;
  }

  const selectedStartups = await selectStartupsForDigest();
  if (selectedStartups.length === 0) {
    console.error("No startups found");
    process.exit(1);
  }

  console.log(
    `Sending digest with ${selectedStartups.length} startups to ${verifiedSubscribers.length} subscribers`
  );
  console.log(
    "Featured companies:",
    selectedStartups.map((s) => s.name).join(", ")
  );

  let sent = 0;
  for (const subscriber of verifiedSubscribers) {
    const unsubscribeUrl = `${
      process.env.APP_URL || "https://www.closedcompanies.site"
    }/api/digest/unsubscribe?token=${encodeURIComponent(
      subscriber.unsubscribeToken
    )}`;

    try {
      await sendDigestEmail({
        to: subscriber.email,
        startups: selectedStartups,
        unsubscribeUrl,
      });

      // Update last sent timestamp
      await Subscriber.findByIdAndUpdate(subscriber._id, {
        lastEmailSent: new Date(),
        $inc: { emailsSent: 1 },
      });

      sent += 1;
      console.log(`✓ Sent to ${subscriber.email}`);
    } catch (e) {
      console.error(`✗ Failed to send to ${subscriber.email}:`, e);
    }
  }

  console.log(
    `Digest sent to ${sent}/${verifiedSubscribers.length} subscribers`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
