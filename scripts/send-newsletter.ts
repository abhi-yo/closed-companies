import "dotenv/config";
import connectDB from "@/lib/mongodb";
import Startup from "@/lib/models/Startup";
import NewsletterSubscriber from "@/lib/models/Subscriber";
import { renderNewsletterHTML, sendEmail } from "@/lib/email";

async function main() {
  await connectDB();

  const activeSubscribers = await NewsletterSubscriber.find({
    unsubscribedAt: null,
    verified: true, // Only send to verified subscribers
    bounced: { $ne: true }, // Exclude bounced emails
    complained: { $ne: true }, // Exclude emails that complained
  }).lean();
  if (activeSubscribers.length === 0) {
    console.log("No subscribers");
    return;
  }

  const total = await Startup.countDocuments({});
  const rand = Math.floor(Math.random() * total);
  const [randomStartup] = await Startup.find({}).skip(rand).limit(1).lean();
  if (!randomStartup) {
    console.error("No startup found");
    process.exit(1);
  }

  let sent = 0;
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
      console.log(`✓ Sent to ${sub.email}`);
    } catch (e) {
      console.error("✗ Failed to send to", sub.email, e);
    }
  }
  console.log("Sent", sent);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



