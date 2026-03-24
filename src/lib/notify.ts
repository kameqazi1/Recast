import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export async function notifyAdmin({
  subject,
  message,
  details,
}: {
  subject: string;
  message: string;
  details?: Record<string, string | number>;
}) {
  const detailsHtml = details
    ? `<table style="margin-top:16px;border-collapse:collapse;">
        ${Object.entries(details)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#ACAAAD;">${k}</td><td style="padding:4px 0;color:#F6F3F5;font-weight:600;">${v}</td></tr>`
          )
          .join("")}
       </table>`
    : "";

  await resend.emails.send({
    from: "Recast <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: `[Recast] ${subject}`,
    html: `
      <div style="font-family:'DM Sans',sans-serif;background:#0E0E10;color:#F6F3F5;padding:32px;border-radius:12px;">
        <h2 style="color:#F59E0B;margin:0 0 8px;">${subject}</h2>
        <p style="color:#ACAAAD;margin:0 0 16px;font-size:14px;">${message}</p>
        ${detailsHtml}
        <hr style="border:none;border-top:1px solid #48474A;margin:24px 0;" />
        <p style="color:#48474A;font-size:12px;margin:0;">Recast Free Tier Monitor</p>
      </div>
    `,
  });
}
