import "dotenv/config";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { sendEmail, renderWelcomeEmailHTML } from "@/lib/email";

async function testWelcomeEmail() {
  await connectDB();

  const testEmail = "akshatsing11@gmail.com";

  console.log("Testing welcome email for:", testEmail);

  // Check if subscriber exists
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

  const unsubscribeUrl = `${
    process.env.APP_URL || "https://www.closedcompanies.site"
  }/api/digest/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribeToken
  )}`;

  console.log("Sending welcome email...");

  try {
    const welcomeHtml = renderWelcomeEmailHTML(unsubscribeUrl);

    const result = await sendEmail({
      to: subscriber.email,
      subject: "Welcome to Closed Companies Digest! 🎉",
      html: welcomeHtml,
      listUnsubscribe: unsubscribeUrl,
    });

    console.log("✅ Welcome email sent successfully!");
    console.log("Resend response:", result);
  } catch (error: any) {
    console.error("❌ Failed to send welcome email:");
    console.error(error);

    if (error?.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testWelcomeEmail()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
