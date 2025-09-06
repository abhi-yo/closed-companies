import { Resend } from "resend";
import type { Startup } from "@/lib/data";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Closed Companies <digest@closedcompanies.com>";
const APP_URL = process.env.APP_URL || "https://www.closedcompanies.site";

if (!RESEND_API_KEY) {
  console.warn(
    "[digestEmail] RESEND_API_KEY not set; email sending will fail until configured"
  );
}

const resend = new Resend(RESEND_API_KEY);

export function renderWeeklyDigestHTML(
  startups: Startup[],
  unsubscribeUrl: string
) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sponsorName = process.env.NEWSLETTER_SPONSOR_NAME;
  const sponsorUrl = process.env.NEWSLETTER_SPONSOR_URL;
  const sponsorText = process.env.NEWSLETTER_SPONSOR_TEXT;
  const utm = `utm_source=digest&utm_medium=email&utm_campaign=weekly_digest`;

  const startupsHtml = startups
    .map(
      (startup) => `
    <div class="startup-card">
      <h2 class="startup-title">${startup.name}</h2>
      <div class="startup-meta">
        ${startup.industry} • Founded ${startup.founded} • Shut down ${
        startup.shutDown
      } • ${startup.country} • ${startup.funding}
      </div>
      <p class="startup-description">${startup.description}</p>
      <div class="failure-section">
        <h3>Why it failed:</h3>
        <p>${startup.causeOfShutdown}</p>
      </div>
      ${
        startup.articleUrl
          ? `
        <div class="article-link">
          <a href="${startup.articleUrl}${
              startup.articleUrl.includes("?") ? "&" : "?"
            }${utm}" 
             target="_blank" rel="noopener noreferrer" class="read-more-btn">
            Read the full story →
          </a>
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Weekly Digest: ${startups.length} Startup Failures</title>
    <style>
      body{background-color:#f8f9fa;color:#212529;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.6}
      .container{max-width:680px;margin:0 auto;padding:24px}
      .header{text-align:center;margin-bottom:32px;padding:24px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
      .logo{width:48px;height:48px;border-radius:8px;margin-bottom:16px}
      .header-title{font-size:28px;font-weight:700;color:#212529;margin:0 0 8px 0}
      .header-subtitle{font-size:16px;color:#6c757d;margin:0}
      .startup-card{background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
      .startup-title{font-size:22px;font-weight:700;color:#212529;margin:0 0 8px 0}
      .startup-meta{font-size:14px;color:#6c757d;margin-bottom:16px;padding:8px 12px;background:#f8f9fa;border-radius:6px}
      .startup-description{font-size:16px;color:#495057;margin:0 0 16px 0}
      .failure-section{background:#fff5f5;border-left:4px solid #dc3545;padding:16px;margin:16px 0;border-radius:0 8px 8px 0}
      .failure-section h3{font-size:16px;font-weight:600;color:#dc3545;margin:0 0 8px 0}
      .failure-section p{margin:0;color:#721c24}
      .article-link{margin-top:16px}
      .read-more-btn{display:inline-block;background:#007bff;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:500;font-size:14px}
      .read-more-btn:hover{background:#0056b3}
      .sponsor-section{background:#e3f2fd;border:1px solid #bbdefb;border-radius:8px;padding:16px;margin:24px 0;text-align:center}
      .sponsor-label{font-size:12px;color:#1976d2;font-weight:600;text-transform:uppercase;margin:0 0 8px 0}
      .sponsor-text{margin:0 0 12px 0;color:#1565c0}
      .sponsor-btn{display:inline-block;background:#1976d2;color:#fff;text-decoration:none;padding:8px 16px;border-radius:6px;font-weight:500}
      .footer{text-align:center;color:#6c757d;font-size:12px;margin-top:32px;padding:16px}
      .footer a{color:#007bff}
      @media (max-width: 600px) {
        .container{padding:16px}
        .startup-card{padding:16px}
        .header{padding:16px}
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${APP_URL}/logo.png" alt="Closed Companies" class="logo" />
        <h1 class="header-title">Weekly Startup Digest</h1>
        <p class="header-subtitle">${currentDate} • ${
    startups.length
  } Failed Companies</p>
      </div>

      ${startupsHtml}

      ${
        sponsorName && sponsorUrl
          ? `
        <div class="sponsor-section">
          <p class="sponsor-label">Sponsored</p>
          <p class="sponsor-text">${sponsorText || "Check out our sponsor"}</p>
          <a href="${sponsorUrl}?${utm}" target="_blank" rel="noopener noreferrer" class="sponsor-btn">
            ${sponsorName}
          </a>
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>You're receiving this digest because you're a paid subscriber to Closed Companies.</p>
        <p><a href="${unsubscribeUrl}">Unsubscribe</a> • <a href="${APP_URL}">Visit Website</a></p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendDigestEmail(options: {
  to: string;
  startups: Startup[];
  unsubscribeUrl: string;
}) {
  const html = renderWeeklyDigestHTML(options.startups, options.unsubscribeUrl);

  return resend.emails.send({
    from: EMAIL_FROM,
    to: options.to,
    subject: `Weekly Digest: ${options.startups.length} Startup Failures Analyzed`,
    html,
    headers: {
      "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
    },
  });
}
