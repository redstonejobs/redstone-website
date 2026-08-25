import "server-only";

import { Resend } from "resend";

let resendClient: Resend | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = getRequiredEnv("RESEND_API_KEY");
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getEmailConfig() {
  const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");

  const fromName =
    process.env.RESEND_FROM_NAME?.trim() ||
    "Red Stone Employment Agency";

  const replyTo =
    process.env.RESEND_REPLY_TO?.trim() ||
    process.env.HR_SUPPORT_EMAIL?.trim() ||
    undefined;

  return {
    fromEmail,
    fromName,
    replyTo,
    from: `${fromName} <${fromEmail}>`,
  };
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailInput) {
  const resend = getResendClient();
  const config = getEmailConfig();

  const { data, error } = await resend.emails.send({
    from: config.from,
    to,
    subject,
    html,
    text,
    replyTo: replyTo || config.replyTo,
  });

  if (error) {
    console.error("Resend email error:", error);

    throw new Error(
      error.message || "Red Stone email could not be sent."
    );
  }

  return data;
}