import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/Subscriber";
import { sendEmail, renderWelcomeEmailHTML } from "@/lib/email";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(
        new URL("/newsletter/confirmed?error=missing", request.url)
      );
    }
    const sub = await NewsletterSubscriber.findOne({
      verificationToken: token,
    });
    if (!sub) {
      return NextResponse.redirect(
        new URL("/newsletter/confirmed?error=invalid", request.url)
      );
    }
    sub.verified = true;
    sub.verifiedAt = new Date();
    sub.verificationToken = null;
    await sub.save();

    // Send welcome email
    try {
      const unsubscribeUrl = `${
        process.env.APP_URL || "https://www.closedcompanies.site"
      }/api/newsletter/unsubscribe?token=${encodeURIComponent(
        sub.unsubscribeToken
      )}`;

      const welcomeHtml = renderWelcomeEmailHTML(unsubscribeUrl);

      await sendEmail({
        to: sub.email,
        subject: "Welcome to Closed Companies! 🎉",
        html: welcomeHtml,
        listUnsubscribe: unsubscribeUrl,
      });

      console.log(`Welcome email sent to ${sub.email}`);
    } catch (emailError) {
      console.error(
        `Failed to send welcome email to ${sub.email}:`,
        emailError
      );
      // Don't fail the confirmation if email sending fails
    }

    return NextResponse.redirect(
      new URL("/newsletter/confirmed?ok=1", request.url)
    );
  } catch (error) {
    console.error("Confirm error", error);
    return NextResponse.redirect(
      new URL("/newsletter/confirmed?error=server", request.url)
    );
  }
}
