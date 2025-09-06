import { Resend } from "resend";
import type { Startup } from "@/lib/data";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Closed Companies <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "https://www.closedcompanies.site";

if (!RESEND_API_KEY) {
  console.warn(
    "[email] RESEND_API_KEY not set; email sending will fail until configured"
  );
}

const resend = new Resend(RESEND_API_KEY);

export function renderNewsletterHTML(startup: Startup, unsubscribeUrl: string) {
  const preheader = `A story from ${startup.name} — ${startup.industry} (${startup.shutDown})`;
  const sponsorName = process.env.NEWSLETTER_SPONSOR_NAME;
  const sponsorUrl = process.env.NEWSLETTER_SPONSOR_URL;
  const sponsorText = process.env.NEWSLETTER_SPONSOR_TEXT;
  const utm = `utm_source=newsletter&utm_medium=email&utm_campaign=closed_companies`;
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Closed Companies — Lessons from ${startup.name}</title>
    <style>
      body{background-color:#0B0B0B;color:#fff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif}
      .container{max-width:640px;margin:0 auto;padding:24px}
      .card{background:#121212;border:1px solid #2a2a2a;border-radius:12px;padding:24px}
      .btn{display:inline-block;background:#fff;color:#000;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600}
      .muted{color:#b3b3b3}
      .footer{color:#8a8a8a;font-size:12px;margin-top:24px}
      .title{font-size:26px;line-height:32px;margin:0 0 8px 0}
      .subtitle{font-size:14px;margin:0 0 16px 0;color:#b3b3b3}
      .divider{height:1px;background:#2a2a2a;margin:16px 0}
      @media (prefers-color-scheme: light) {
        body{background:#f6f6f6;color:#000}
        .card{background:#fff;border-color:#eee}
        .btn{background:#000;color:#fff}
      }
    </style>
  </head>
  <body>
    <span style="display:none;color:transparent;opacity:0;height:0;width:0;overflow:hidden">${preheader}</span>
    <div class="container">
      <div style="text-align:center;margin-bottom:16px">
        <img src="${APP_URL}/logo.png" alt="Closed Companies" width="48" height="48" style="border-radius:8px" />
      </div>
      <div class="card">
        <h1 class="title">${startup.name}</h1>
        <p class="subtitle">${startup.industry} • Founded ${
    startup.founded
  } • Shut down ${startup.shutDown} • ${startup.country}</p>
        <p style="margin:0 0 12px 0">${startup.description}</p>
        <div class="divider"></div>
        <p style="margin:0 0 12px 0"><strong>Why it shut down:</strong> ${
          startup.causeOfShutdown
        }</p>
        ${
          startup.articleUrl
            ? `<p style="margin:0 0 16px 0"><a class="btn" href="${
                startup.articleUrl
              }${
                startup.articleUrl.includes("?") ? "&" : "?"
              }${utm}" target="_blank" rel="noopener noreferrer">Read original article</a></p>`
            : ""
        }
        <p class="muted" style="margin:0">Want more? Explore hundreds of stories on Closed Companies.</p>
      </div>
      ${
        sponsorName && sponsorUrl
          ? `<div class="card" style="margin-top:12px"><p style="margin:0 0 8px 0; font-weight:700">Sponsored</p><p style="margin:0 0 8px 0">${
              sponsorText || ""
            }</p><p style="margin:0"><a class="btn" href="${sponsorUrl}" target="_blank" rel="noopener noreferrer">${sponsorName}</a></p></div>`
          : ""
      }
      <div class="footer">
        You are receiving this because you subscribed at ${APP_URL}. If this isn't you, <a href="${unsubscribeUrl}">unsubscribe</a>.
      </div>
    </div>
  </body>
</html>`;
}

export function renderWelcomeEmailHTML(unsubscribeUrl: string) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome to Closed Companies Digest</title>
    <style>
      body {
        background-color: #ffffff;
        color: #1f2937;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
      }
      .header {
        background: #1f2937;
        color: #ffffff;
        padding: 40px 30px;
        text-align: center;
      }
      .logo-text {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
      }
      .tagline {
        font-size: 14px;
        color: #9ca3af;
        margin: 0;
        font-weight: 500;
      }
      .content {
        padding: 40px 30px;
        background: #ffffff;
      }
      .greeting {
        font-size: 18px;
        color: #1f2937;
        margin: 0 0 20px 0;
        font-weight: 600;
      }
      .description {
        font-size: 16px;
        color: #4b5563;
        margin: 0 0 30px 0;
        line-height: 1.7;
      }
      .features {
        margin: 30px 0;
      }
      .feature {
        display: flex;
        align-items: flex-start;
        margin: 16px 0;
        font-size: 15px;
        color: #374151;
      }
      .feature-icon {
        width: 18px;
        height: 18px;
        margin-right: 12px;
        margin-top: 2px;
        color: #059669;
        font-weight: bold;
        font-size: 14px;
        flex-shrink: 0;
      }
      .expectations {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 24px;
        margin: 30px 0;
      }
      .expectations-title {
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 16px 0;
        font-size: 16px;
      }
      .expectations ul {
        margin: 0;
        padding-left: 20px;
        list-style: disc;
        color: #4b5563;
      }
      .expectations li {
        margin: 8px 0;
        font-size: 15px;
        line-height: 1.5;
      }
      .cta {
        text-align: center;
        margin: 30px 0;
      }
      .cta-link {
        display: inline-block;
        background: #1f2937 !important;
        color: #ffffff !important;
        text-decoration: none !important;
        padding: 14px 28px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 15px;
        letter-spacing: 0.3px;
        border: none;
      }
      .cta-link:hover {
        background: #374151 !important;
        color: #ffffff !important;
      }
      .footer {
        background: #f9fafb;
        color: #6b7280;
        font-size: 13px;
        padding: 24px 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer a {
        color: #4b5563;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .support {
        background: #f3f4f6;
        border-radius: 6px;
        padding: 16px;
        margin: 24px 0;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      @media (max-width: 600px) {
        .container {
          padding: 0;
        }
        .header, .content, .footer {
          padding-left: 20px;
          padding-right: 20px;
        }
        .header {
          padding-top: 30px;
          padding-bottom: 30px;
        }
        .content {
          padding-top: 30px;
          padding-bottom: 30px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-text">Closed Companies</div>
        <div class="tagline">Weekly Startup Failure Stories</div>
      </div>
      
      <div class="content">
        <p class="greeting">Thanks for subscribing!</p>
        
        <p class="description">
          You're now part of our community of founders, investors, and entrepreneurs who learn from startup failures. Every Monday, we'll deliver 4-5 detailed case studies of companies that didn't make it, complete with analysis of what went wrong and actionable insights.
        </p>
        
        <div class="features">
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>4-5 detailed startup failure stories weekly</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>In-depth analysis of what went wrong</span>
          </div>
          <div class="feature">
            <span class="feature-icon">✓</span>
            <span>Free forever • Unsubscribe anytime</span>
          </div>
        </div>
        
        <div class="expectations">
          <p class="expectations-title">What to expect:</p>
          <ul>
            <li>Your first digest will arrive next Monday</li>
            <li>Each story includes the company's background, what they tried, and why they failed</li>
            <li>We focus on actionable lessons you can apply to your own ventures</li>
          </ul>
        </div>
        
        <div class="cta">
          <a href="${APP_URL}" class="cta-link" style="display: inline-block; background: #1f2937; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Explore Our Archive</a>
        </div>
        
        <div class="support">
          <p style="margin: 0;">Questions? Just reply to this email and we'll get back to you!</p>
        </div>
      </div>
      
      <div class="footer">
        <p>You are receiving this because you subscribed at <a href="${APP_URL}">closedcompanies.site</a></p>
        <p>If this isn't you, <a href="${unsubscribeUrl}">unsubscribe here</a></p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  listUnsubscribe?: string;
}) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const emailOptions: any = {
    from: EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    headers: {
      "X-Entity-Ref-ID": new Date().getTime().toString(),
      ...(options.listUnsubscribe
        ? { "List-Unsubscribe": `<${options.listUnsubscribe}>` }
        : {}),
    },
  };

  try {
    const result = await resend.emails.send(emailOptions);
    console.log(`Email sent successfully to ${options.to}:`, result.data?.id);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
}
