import { Resend } from "resend";
import type { Startup } from "@/lib/data";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Closed Companies <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

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
      'X-Entity-Ref-ID': new Date().getTime().toString(),
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
