import "server-only";

/* ============================================================
   RED STONE EMPLOYMENT AGENCY
   STAFF EMAIL NOTIFICATION SERVICE

   Environment variables:

   RESEND_API_KEY=
   RESEND_FROM_EMAIL=noreply@redstone.co.ke
   RESEND_FROM_NAME=Red Stone Employment Agency
   RESEND_REPLY_TO=support@redstone.co.ke
   NEXT_PUBLIC_SITE_URL=https://redstone.co.ke
============================================================ */

/* ============================================================
   BRAND CONFIGURATION
============================================================ */

const BRAND = {
  companyName: "Red Stone Employment Agency",
  navy: "#071A3D",
  gold: "#D4AF37",
  lightGold: "#F2D675",

  supportEmail:
    process.env.RESEND_REPLY_TO?.trim() ||
    "support@redstone.co.ke",

  website:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000",
};

/* ============================================================
   TYPES
============================================================ */

export type StaffWelcomeNotificationData = {
  to: string;

  fullName: string;

  staffId?: string | null;
  personnelRecordNo?: string | null;
  referralCode?: string | null;

  jobTitle?: string | null;
  department?: string | null;
  dutyStation?: string | null;

  employmentType?: string | null;

  employmentStartDate?: string | null;
  appointmentDate?: string | null;

  reportingOfficer?: string | null;

  role?: string | null;

  workingDaysPerWeek?: number | null;
  workingHoursPerDay?: number | null;
  workingHoursPerWeek?: number | null;
  workSchedule?: string | null;

  probationPeriodMonths?: number | null;

  /*
   * Optional secure activation URL.
   *
   * We will connect this to Supabase account activation.
   * Existing code can continue calling this function without it.
   */
  activationUrl?: string | null;

  /*
   * One-time temporary password issued during staff account creation.
   * The employee must replace it immediately after first login.
   */
  temporaryPassword?: string | null;
};

export type StaffNotificationResult = {
  sent: boolean;
  messageId?: string;
  reason?: string;
};

/* ============================================================
   FORMATTING HELPERS
============================================================ */

function safeText(
  value: string | number | null | undefined,
  fallback = "Not specified"
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlValue(
  value: string | number | null | undefined,
  fallback = "Not specified"
): string {
  return escapeHtml(
    safeText(value, fallback)
  );
}

function formatCode(
  value?: string | null
): string {
  if (!value) {
    return "Pending system assignment";
  }

  return value;
}

function formatEmploymentType(
  value?: string | null
): string {
  switch (value) {
    case "full_time":
      return "Full Time";

    case "part_time":
      return "Part Time";

    case "contract":
      return "Fixed-Term Contract";

    case "temporary":
      return "Temporary";

    case "intern":
      return "Internship";

    default:
      return safeText(value);
  }
}

function formatRole(
  value?: string | null
): string {
  switch (value) {
    case "super_admin":
      return "Super Administrator";

    case "admin":
      return "Administrator";

    case "hr":
      return "Human Resources Officer";

    case "finance":
      return "Finance Officer";

    case "recruiter":
      return "Recruitment Officer";

    case "moderator":
      return "Moderator";

    case "staff":
      return "General Staff";

    default:
      return safeText(value);
  }
}

function formatWorkSchedule(
  value?: string | null
): string {
  switch (value) {
    case "monday_friday":
      return "Monday - Friday";

    case "monday_saturday":
      return "Monday - Saturday";

    case "shift":
      return "Shift Schedule";

    case "rotational":
      return "Rotational Schedule";

    case "flexible":
      return "Flexible Schedule";

    case "remote":
      return "Remote Schedule";

    case "hybrid":
      return "Hybrid Schedule";

    default:
      return safeText(value);
  }
}

function cleanSiteUrl(): string {
  return BRAND.website.replace(/\/+$/, "");
}

/* ============================================================
   RESEND EMAIL TRANSPORT
============================================================ */

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<StaffNotificationResult> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const fromAddress =
    process.env.RESEND_FROM_EMAIL?.trim();

  const fromName =
    process.env.RESEND_FROM_NAME?.trim() ||
    BRAND.companyName;

  const replyTo =
    process.env.RESEND_REPLY_TO?.trim() ||
    "support@redstone.co.ke";

  if (!apiKey) {
    return {
      sent: false,
      reason:
        "RESEND_API_KEY is not configured.",
    };
  }

  if (!fromAddress) {
    return {
      sent: false,
      reason:
        "RESEND_FROM_EMAIL is not configured.",
    };
  }

  const fromEmail =
    `${fromName} <${fromAddress}>`;

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      }
    );

    const result =
      (await response.json()) as {
        id?: string;
        message?: string;
        error?: string;
        name?: string;
      };

    if (!response.ok) {
      return {
        sent: false,
        reason:
          result.message ||
          result.error ||
          result.name ||
          `Resend returned HTTP ${response.status}.`,
      };
    }

    return {
      sent: true,
      messageId: result.id,
    };
  } catch (error) {
    return {
      sent: false,
      reason:
        error instanceof Error
          ? error.message
          : "Unknown email delivery error.",
    };
  }
}

/* ============================================================
   STAFF WELCOME / APPOINTMENT EMAIL
============================================================ */

export async function sendStaffWelcomeNotification(
  data: StaffWelcomeNotificationData
): Promise<StaffNotificationResult> {
  const employeeName =
    safeText(data.fullName, "Employee");

  const staffId =
    formatCode(data.staffId);

  const personnelRecordNo =
    formatCode(data.personnelRecordNo);

  const referralCode =
    formatCode(data.referralCode);

  const role =
    formatRole(data.role);

  const employmentType =
    formatEmploymentType(
      data.employmentType
    );

  const workSchedule =
    formatWorkSchedule(
      data.workSchedule
    );

  const employmentStartDate =
    data.employmentStartDate ||
    data.appointmentDate ||
    null;

  const loginUrl =
    `${cleanSiteUrl()}/login`;

  const temporaryPassword =
    data.temporaryPassword?.trim() || null;

  const primaryActionUrl =
    loginUrl;

  const primaryActionLabel =
    "Open Staff Login";

  const subject =
    "Welcome to Red Stone - Staff Appointment & Account Information";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(subject)}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      background:#f1f5f9;
      padding:30px 12px;
    "
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:720px;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            border:1px solid #e2e8f0;
          "
        >

          <!-- GOLD TOP BORDER -->
          <tr>
            <td
              style="
                height:5px;
                background:${BRAND.gold};
                font-size:0;
              "
            >
              &nbsp;
            </td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td
              style="
                background:${BRAND.navy};
                padding:28px 32px;
              "
            >
              <div
                style="
                  color:${BRAND.lightGold};
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:2px;
                  text-transform:uppercase;
                "
              >
                ${escapeHtml(BRAND.companyName)}
              </div>

              <div
                style="
                  color:#ffffff;
                  font-size:25px;
                  line-height:32px;
                  font-weight:800;
                  margin-top:8px;
                "
              >
                Employee Appointment & Onboarding
              </div>

              <div
                style="
                  color:#cbd5e1;
                  font-size:12px;
                  margin-top:7px;
                "
              >
                Secure Personnel Administration System
              </div>
            </td>
          </tr>

          <!-- CONFIDENTIAL NOTICE -->
          <tr>
            <td
              style="
                background:#fff7ed;
                border-bottom:1px solid #fed7aa;
                padding:12px 32px;
                color:#9a3412;
                font-size:11px;
                font-weight:700;
              "
            >
              CONFIDENTIAL PERSONNEL COMMUNICATION
            </td>
          </tr>

          <!-- MAIN BODY -->
          <tr>
            <td style="padding:32px;">

              <p
                style="
                  margin:0;
                  font-size:16px;
                  line-height:26px;
                "
              >
                Dear
                <strong>
                  ${escapeHtml(employeeName)}
                </strong>,
              </p>

              <p
                style="
                  margin:18px 0 0;
                  font-size:14px;
                  line-height:24px;
                  color:#334155;
                "
              >
                Welcome to
                <strong>
                  ${escapeHtml(BRAND.companyName)}
                </strong>.
                Your official employee personnel record has been
                established in the Red Stone administration system.
              </p>

              <p
                style="
                  margin:14px 0 0;
                  font-size:14px;
                  line-height:24px;
                  color:#334155;
                "
              >
                Please review the appointment and personnel
                information below. If any information is incorrect,
                contact the administration office before commencing
                official duties.
              </p>

              <!-- PERSONNEL IDENTIFICATION -->
              <div
                style="
                  margin-top:28px;
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:10px;
                  padding:20px;
                "
              >
                <div
                  style="
                    color:${BRAND.navy};
                    font-size:12px;
                    font-weight:800;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    margin-bottom:15px;
                  "
                >
                  Personnel Identification
                </div>

                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="7"
                  border="0"
                  style="font-size:13px;"
                >
                  <tr>
                    <td
                      width="42%"
                      style="color:#64748b;"
                    >
                      Staff ID
                    </td>

                    <td
                      style="
                        font-weight:700;
                        color:${BRAND.navy};
                      "
                    >
                      ${escapeHtml(staffId)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Personnel Record No.
                    </td>

                    <td style="font-weight:700;">
                      ${escapeHtml(personnelRecordNo)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Referral Code
                    </td>

                    <td style="font-weight:700;">
                      ${escapeHtml(referralCode)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- EMPLOYMENT ASSIGNMENT -->
              <div
                style="
                  margin-top:18px;
                  border:1px solid #e2e8f0;
                  border-radius:10px;
                  padding:20px;
                "
              >
                <div
                  style="
                    color:${BRAND.navy};
                    font-size:12px;
                    font-weight:800;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    margin-bottom:15px;
                  "
                >
                  Employment Assignment
                </div>

                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="7"
                  border="0"
                  style="font-size:13px;"
                >
                  <tr>
                    <td
                      width="42%"
                      style="color:#64748b;"
                    >
                      Job Title
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.jobTitle)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Department
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.department)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Duty Station
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.dutyStation)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Employment Type
                    </td>

                    <td style="font-weight:700;">
                      ${escapeHtml(employmentType)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Employment Start Date
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(employmentStartDate)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Reporting Officer
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.reportingOfficer)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      System Role
                    </td>

                    <td style="font-weight:700;">
                      ${escapeHtml(role)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- WORKING ARRANGEMENT -->
              <div
                style="
                  margin-top:18px;
                  border:1px solid #e2e8f0;
                  border-radius:10px;
                  padding:20px;
                "
              >
                <div
                  style="
                    color:${BRAND.navy};
                    font-size:12px;
                    font-weight:800;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    margin-bottom:15px;
                  "
                >
                  Working Arrangement
                </div>

                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="7"
                  border="0"
                  style="font-size:13px;"
                >
                  <tr>
                    <td
                      width="42%"
                      style="color:#64748b;"
                    >
                      Working Days / Week
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.workingDaysPerWeek)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Working Hours / Day
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.workingHoursPerDay)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Working Hours / Week
                    </td>

                    <td style="font-weight:700;">
                      ${htmlValue(data.workingHoursPerWeek)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Schedule
                    </td>

                    <td style="font-weight:700;">
                      ${escapeHtml(workSchedule)}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#64748b;">
                      Probation Period
                    </td>

                    <td style="font-weight:700;">
                      ${
                        data.probationPeriodMonths !== null &&
                        data.probationPeriodMonths !== undefined
                          ? `${data.probationPeriodMonths} month(s)`
                          : "Not specified"
                      }
                    </td>
                  </tr>
                </table>
              </div>

              <!-- ACCOUNT SECURITY -->
              <div
                style="
                  margin-top:24px;
                  background:#eff6ff;
                  border:1px solid #bfdbfe;
                  border-radius:10px;
                  padding:20px;
                "
              >
                <div
                  style="
                    color:#1e3a8a;
                    font-size:12px;
                    font-weight:800;
                    text-transform:uppercase;
                  "
                >
                  Staff Account Security
                </div>

                <p
                  style="
                    margin:10px 0 0;
                    color:#1e40af;
                    font-size:13px;
                    line-height:21px;
                  "
                >
                  Your Red Stone staff account has been created.
                  Use the temporary login credentials below.
                  For security, you will be required to create
                  your own private password immediately after
                  your first successful login.
                </p>

                <div
                  style="
                    margin-top:16px;
                    background:#ffffff;
                    border:1px solid #bfdbfe;
                    border-radius:8px;
                    padding:16px;
                  "
                >
                  <div
                    style="
                      font-size:11px;
                      color:#64748b;
                      text-transform:uppercase;
                      font-weight:700;
                      letter-spacing:.6px;
                    "
                  >
                    Login Email
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      font-size:14px;
                      font-weight:700;
                      color:#0f172a;
                    "
                  >
                    ${escapeHtml(data.to)}
                  </div>

                  <div
                    style="
                      margin-top:14px;
                      font-size:11px;
                      color:#64748b;
                      text-transform:uppercase;
                      font-weight:700;
                      letter-spacing:.6px;
                    "
                  >
                    Temporary Password
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      font-family:Consolas,Monaco,monospace;
                      font-size:15px;
                      font-weight:800;
                      color:#071A3D;
                    "
                  >
                    ${escapeHtml(
                      temporaryPassword ||
                        "Provided separately"
                    )}
                  </div>

                  <div
                    style="
                      margin-top:12px;
                      color:#b45309;
                      font-size:12px;
                      font-weight:700;
                      line-height:19px;
                    "
                  >
                    You must change this temporary password
                    immediately after your first login.
                  </div>
                </p>

                <p
                  style="
                    margin:10px 0 0;
                    color:#1e40af;
                    font-size:13px;
                    line-height:21px;
                  "
                >
                  Red Stone administrators will never ask you
                  to send your password by email, WhatsApp,
                  SMS or ordinary text message.
                </p>

                <div style="margin-top:18px;">
                  <a
                    href="${escapeHtml(primaryActionUrl)}"
                    style="
                      display:inline-block;
                      background:${BRAND.navy};
                      color:#ffffff;
                      text-decoration:none;
                      padding:12px 22px;
                      border-radius:7px;
                      font-size:13px;
                      font-weight:700;
                    "
                  >
                    ${escapeHtml(primaryActionLabel)}
                  </a>
                </div>
              </div>

              <!-- NEXT STEPS -->
              <div style="margin-top:28px;">

                <div
                  style="
                    color:${BRAND.navy};
                    font-size:13px;
                    font-weight:800;
                  "
                >
                  Your onboarding responsibilities
                </div>

                <ol
                  style="
                    padding-left:22px;
                    margin:12px 0 0;
                    color:#334155;
                    font-size:13px;
                    line-height:23px;
                  "
                >
                  <li>
                    Complete your secure account activation.
                  </li>

                  <li>
                    Verify your personnel information.
                  </li>

                  <li>
                    Follow your department's reporting and
                    induction instructions.
                  </li>

                  <li>
                    Keep your login credentials confidential.
                  </li>

                  <li>
                    Report incorrect personnel information
                    to the administration office.
                  </li>
                </ol>
              </div>

              <!-- SUPPORT -->
              <div
                style="
                  margin-top:28px;
                  padding-top:20px;
                  border-top:1px solid #e2e8f0;
                  color:#475569;
                  font-size:12px;
                  line-height:20px;
                "
              >
                For staff assistance, contact:

                <br />

                <strong>
                  ${escapeHtml(BRAND.supportEmail)}
                </strong>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                background:${BRAND.navy};
                padding:22px 32px;
                text-align:center;
              "
            >
              <div
                style="
                  color:#ffffff;
                  font-size:11px;
                  font-weight:700;
                "
              >
                ${escapeHtml(BRAND.companyName)}
              </div>

              <div
                style="
                  color:#94a3b8;
                  font-size:10px;
                  line-height:17px;
                  margin-top:6px;
                "
              >
                Confidential personnel communication.
                Intended only for the named recipient.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
RED STONE EMPLOYMENT AGENCY
EMPLOYEE APPOINTMENT & ONBOARDING

Dear ${employeeName},

Welcome to ${BRAND.companyName}.

Your official employee personnel record has been created.

PERSONNEL IDENTIFICATION

Staff ID:
${staffId}

Personnel Record Number:
${personnelRecordNo}

Referral Code:
${referralCode}


EMPLOYMENT ASSIGNMENT

Job Title:
${safeText(data.jobTitle)}

Department:
${safeText(data.department)}

Duty Station:
${safeText(data.dutyStation)}

Employment Type:
${employmentType}

Employment Start Date:
${safeText(employmentStartDate)}

Reporting Officer:
${safeText(data.reportingOfficer)}

System Role:
${role}


WORKING ARRANGEMENT

Working Days Per Week:
${safeText(data.workingDaysPerWeek)}

Working Hours Per Day:
${safeText(data.workingHoursPerDay)}

Working Hours Per Week:
${safeText(data.workingHoursPerWeek)}

Work Schedule:
${workSchedule}

Probation Period:
${
  data.probationPeriodMonths !== null &&
  data.probationPeriodMonths !== undefined
    ? `${data.probationPeriodMonths} month(s)`
    : "Not specified"
}


ACCOUNT SECURITY

Staff login:
${loginUrl}

Login email:
${data.to}

Temporary password:
${temporaryPassword || "Provided separately"}

IMPORTANT:
You must change this temporary password immediately after your first login.

Never send your new private password to anyone by email, WhatsApp, SMS or ordinary text message.

For staff assistance:
${BRAND.supportEmail}

${BRAND.companyName}
Confidential Personnel Communication
`;

  return sendEmail({
    to: data.to,
    subject,
    html,
    text,
  });
}

/* ============================================================
   GENERIC STAFF / ADMINISTRATION NOTICE

   Can later be used for:
   - Probation ending
   - Contract expiry
   - Leave approval
   - Suspension
   - Reactivation
   - Role changes
   - Document expiry
============================================================ */

export async function sendStaffHrNotice({
  to,
  fullName,
  subject,
  heading,
  message,
}: {
  to: string;
  fullName: string;
  subject: string;
  heading: string;
  message: string;
}): Promise<StaffNotificationResult> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(subject)}</title>
</head>

<body
  style="
    margin:0;
    padding:30px 12px;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  "
>
  <div
    style="
      max-width:680px;
      margin:0 auto;
      background:#ffffff;
      border:1px solid #e2e8f0;
      border-radius:12px;
      overflow:hidden;
    "
  >
    <div
      style="
        height:5px;
        background:${BRAND.gold};
      "
    ></div>

    <div
      style="
        background:${BRAND.navy};
        padding:24px 28px;
        color:#ffffff;
      "
    >
      <div
        style="
          color:${BRAND.lightGold};
          font-size:10px;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:1.5px;
        "
      >
        ${escapeHtml(BRAND.companyName)}
      </div>

      <div
        style="
          margin-top:7px;
          font-size:21px;
          font-weight:800;
        "
      >
        ${escapeHtml(heading)}
      </div>
    </div>

    <div style="padding:28px;">

      <p
        style="
          font-size:14px;
          line-height:23px;
        "
      >
        Dear
        <strong>
          ${escapeHtml(fullName)}
        </strong>,
      </p>

      <p
        style="
          font-size:14px;
          line-height:24px;
          color:#334155;
          white-space:pre-line;
        "
      >
        ${escapeHtml(message)}
      </p>

      <div
        style="
          margin-top:25px;
          padding-top:18px;
          border-top:1px solid #e2e8f0;
          color:#64748b;
          font-size:11px;
          line-height:18px;
        "
      >
        Administration Office<br />
        ${escapeHtml(BRAND.companyName)}<br />
        ${escapeHtml(BRAND.supportEmail)}
      </div>

    </div>
  </div>
</body>
</html>
`;

  const text = `
${BRAND.companyName}

${heading}

Dear ${fullName},

${message}

Administration Office
${BRAND.companyName}
${BRAND.supportEmail}
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
