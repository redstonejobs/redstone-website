import "server-only";

import { sendEmail } from "@/lib/email/resend";

export type StaffInvitationEmailInput = {
  to: string;
  fullName: string;
  role?: string | null;
  staffId?: string | null;
  activationUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendStaffInvitationEmail({
  to,
  fullName,
  role,
  staffId,
  activationUrl,
}: StaffInvitationEmailInput) {
  const safeName = escapeHtml(fullName);
  const safeRole = escapeHtml(role || "Staff Member");
  const safeStaffId = escapeHtml(staffId || "Pending assignment");
  const safeActivationUrl = escapeHtml(activationUrl);

  const subject = "Welcome to Red Stone Employment Agency";

  const text = `
Dear ${fullName},

Welcome to Red Stone Employment Agency.

Your staff account has been created.

Staff ID: ${staffId || "Pending assignment"}
Role: ${role || "Staff Member"}
Login Email: ${to}

Use the secure link below to activate your account and create your password:

${activationUrl}

For security, do not share your activation link or password with anyone.

If you did not expect this invitation, contact Red Stone Employment Agency support.

Regards,
Red Stone Employment Agency
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:Arial, Helvetica, sans-serif;
    color:#111827;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="background:#f3f4f6;padding:32px 16px;"
  >
    <tr>
      <td align="center">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="
            max-width:640px;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 4px 18px rgba(0,0,0,0.08);
          "
        >
          <tr>
            <td
              style="
                background:#071A3D;
                padding:28px 32px;
                text-align:center;
              "
            >
              <div
                style="
                  color:#D4AF37;
                  font-size:25px;
                  font-weight:700;
                  letter-spacing:1px;
                "
              >
                RED STONE
              </div>

              <div
                style="
                  color:#ffffff;
                  font-size:14px;
                  margin-top:6px;
                  letter-spacing:2px;
                "
              >
                EMPLOYMENT AGENCY
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 32px;">
              <h1
                style="
                  margin:0 0 18px;
                  color:#071A3D;
                  font-size:24px;
                  line-height:1.3;
                "
              >
                Welcome to Red Stone
              </h1>

              <p
                style="
                  margin:0 0 18px;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Dear <strong>${safeName}</strong>,
              </p>

              <p
                style="
                  margin:0 0 22px;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Your official staff account has been created successfully.
                Please review your personnel details below and activate your
                account using the secure link provided.
              </p>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                  border-radius:8px;
                  margin-bottom:26px;
                "
              >
                <tr>
                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      width:38%;
                      font-size:14px;
                      color:#6b7280;
                    "
                  >
                    Staff Name
                  </td>

                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      font-size:14px;
                      font-weight:600;
                      color:#111827;
                    "
                  >
                    ${safeName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      font-size:14px;
                      color:#6b7280;
                    "
                  >
                    Staff ID
                  </td>

                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      font-size:14px;
                      font-weight:600;
                      color:#111827;
                    "
                  >
                    ${safeStaffId}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      font-size:14px;
                      color:#6b7280;
                    "
                  >
                    Role
                  </td>

                  <td
                    style="
                      padding:14px 18px;
                      border-bottom:1px solid #e5e7eb;
                      font-size:14px;
                      font-weight:600;
                      color:#111827;
                    "
                  >
                    ${safeRole}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 18px;
                      font-size:14px;
                      color:#6b7280;
                    "
                  >
                    Login Email
                  </td>

                  <td
                    style="
                      padding:14px 18px;
                      font-size:14px;
                      font-weight:600;
                      color:#111827;
                    "
                  >
                    ${escapeHtml(to)}
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin:30px 0;">
                <a
                  href="${safeActivationUrl}"
                  style="
                    display:inline-block;
                    background:#D4AF37;
                    color:#071A3D;
                    text-decoration:none;
                    font-size:15px;
                    font-weight:700;
                    padding:14px 26px;
                    border-radius:6px;
                  "
                >
                  Activate Staff Account
                </a>
              </div>

              <p
                style="
                  margin:0 0 18px;
                  font-size:14px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                For security, do not share your activation link, password,
                verification codes, or login credentials with anyone.
              </p>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                If the button does not work, copy and paste this link into your
                browser:
              </p>

              <p
                style="
                  margin:8px 0 0;
                  font-size:12px;
                  line-height:1.6;
                  word-break:break-all;
                  color:#2563eb;
                "
              >
                ${safeActivationUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td
              style="
                background:#071A3D;
                padding:22px 32px;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                Red Stone Employment Agency
              </p>

              <p
                style="
                  margin:6px 0 0;
                  color:#D4AF37;
                  font-size:12px;
                "
              >
                Secure Administrative Communication
              </p>
            </td>
          </tr>
        </table>

        <p
          style="
            margin:18px 0 0;
            font-size:11px;
            color:#9ca3af;
            text-align:center;
          "
        >
          This is an automated account notification.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}