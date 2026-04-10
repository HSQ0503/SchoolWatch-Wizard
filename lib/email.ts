import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(
  email: string,
  url: string,
  schoolName: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: "SchoolWatch <noreply@lakerwatch.com>",
    to: email,
    subject: `Edit your ${schoolName} dashboard`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;padding:40px;max-width:560px;">
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">SchoolWatch</p>
                      <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#f1f5f9;">Edit your dashboard</h1>
                      <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.6;">
                        You requested a link to edit the <strong style="color:#e2e8f0;">${schoolName}</strong> dashboard.
                        This link expires in <strong style="color:#e2e8f0;">15 minutes</strong>.
                      </p>
                      <a href="${url}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 28px;border-radius:8px;">
                        Edit Dashboard
                      </a>
                      <p style="margin:32px 0 0;font-size:13px;color:#475569;line-height:1.6;">
                        If you didn't request this, you can safely ignore this email.
                        <br />
                        Or copy this link: <span style="color:#64748b;">${url}</span>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
