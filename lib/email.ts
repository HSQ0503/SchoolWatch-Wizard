import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "SchoolWatch <hello@lakerwatch.com>";
const REPLY_TO = "support@lakerwatch.com";

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  schoolName: string
): Promise<void> {
  // Deterministic idempotency key to prevent duplicate sends on retry
  const idempotencyKey = `magic-link-${email}-${Math.floor(Date.now() / 60000)}`;

  const preheader = `Your manage link for ${schoolName} — expires in 15 minutes`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: email,
    subject: `Manage your ${schoolName} dashboard`,
    headers: {
      "X-Entity-Ref-ID": idempotencyKey,
    },
    text: [
      "SchoolWatch",
      "",
      `Manage your ${schoolName} dashboard`,
      "",
      `You requested a link to manage the ${schoolName} dashboard.`,
      "This link expires in 15 minutes.",
      "",
      `Manage Dashboard: ${url}`,
      "",
      "If you didn't request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="dark" />
          <meta name="supported-color-schemes" content="dark" />
          <title>Manage your ${escHtml(schoolName)} dashboard</title>
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
          <!--[if mso]><table role="presentation" width="100%"><tr><td><![endif]-->
          <!-- Preheader (hidden preview text) -->
          <div style="display:none;font-size:1px;color:#0f172a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
            ${escHtml(preheader)}
            ${"&#847; &zwnj; &nbsp; ".repeat(20)}
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;padding:40px;max-width:560px;width:100%;">
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">SchoolWatch</p>
                      <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#f1f5f9;line-height:1.3;">Manage your dashboard</h1>
                      <p style="margin:0 0 32px;font-size:16px;color:#94a3b8;line-height:1.6;">
                        You requested a link to manage the <strong style="color:#e2e8f0;">${escHtml(schoolName)}</strong> dashboard.
                        This link expires in <strong style="color:#e2e8f0;">15 minutes</strong>.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                        <tr>
                          <td align="center" style="background:#3b82f6;border-radius:8px;">
                            <a href="${escHtml(url)}" target="_blank" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;line-height:1;">
                              Manage Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                        If you didn&rsquo;t request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;color:#334155;text-align:center;line-height:1.5;">
                  Sent by SchoolWatch &middot; <a href="https://www.lakerwatch.com" style="color:#475569;text-decoration:underline;">lakerwatch.com</a>
                </p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Escape HTML special chars to prevent injection in email templates
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
