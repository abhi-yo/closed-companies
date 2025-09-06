import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { sendEmail, renderWelcomeEmailHTML } from "@/lib/email";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${
          process.env.APP_URL || "https://www.closedcompanies.site"
        }/digest/cancelled?error=missing_token`
      );
    }

    const subscriber = await Subscriber.findOne({ verificationToken: token });
    if (!subscriber) {
      return NextResponse.redirect(
        `${
          process.env.APP_URL || "https://www.closedcompanies.site"
        }/digest/cancelled?error=invalid_token`
      );
    }

    subscriber.verified = true;
    subscriber.verifiedAt = new Date();
    subscriber.verificationToken = null;
    await subscriber.save();

    // Send welcome email
    try {
      const unsubscribeUrl = `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/api/digest/unsubscribe?token=${encodeURIComponent(
        subscriber.unsubscribeToken
      )}`;

      const welcomeHtml = renderWelcomeEmailHTML(unsubscribeUrl);

      await sendEmail({
        to: subscriber.email,
        subject: "Welcome to Closed Companies Digest! 🎉",
        html: welcomeHtml,
        listUnsubscribe: unsubscribeUrl,
      });

      console.log(`Welcome email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.error(
        `Failed to send welcome email to ${subscriber.email}:`,
        emailError
      );
      // Don't fail the confirmation if email sending fails
    }

    return NextResponse.redirect(
      `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/digest/success?email=${encodeURIComponent(subscriber.email)}`
    );
  } catch (error) {
    console.error("Digest confirmation error:", error);
    return NextResponse.redirect(
      `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/digest/cancelled?error=confirmation_failed`
    );
  }
}
