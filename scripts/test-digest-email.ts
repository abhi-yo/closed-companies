import "dotenv/config";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import Subscriber from "@/lib/models/Subscriber";
import { sendDigestEmail } from "@/lib/digestEmail";

async function testDigestEmail() {
  await connectDB();

  const email = "akshatsing11@gmail.com";

  console.log("Testing digest email for:", email);

  // Check subscriber
  const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
  if (!subscriber) {
    console.error("Subscriber not found");
    return;
  }

  console.log("Subscriber found:", {
    email: subscriber.email,
    verified: subscriber.verified,
    lastEmail: subscriber.lastEmailSent,
  });

  // Get some sample startups
  const startups = await Startup.find({}).limit(3).lean();
  console.log(
    "Selected startups:",
    startups.map((s) => s.name)
  );

  const unsubscribeUrl = `${
    process.env.APP_URL || "https://www.closedcompanies.site"
  }/api/digest/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribeToken
  )}`;

  console.log("Sending digest email...");

  try {
    const result = await sendDigestEmail({
      to: subscriber.email,
      startups: startups as any,
      unsubscribeUrl,
    });

    console.log("✅ Email sent successfully!");
    console.log("Resend response:", result);

    // Update timestamp
    await Subscriber.findByIdAndUpdate(subscriber._id, {
      lastEmailSent: new Date(),
      $inc: { emailsSent: 1 },
    });
  } catch (error: any) {
    console.error("❌ Failed to send email:");
    console.error(error);

    // Check if it's a Resend API error
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
