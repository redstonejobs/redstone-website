import "server-only";

export const CV_DOCUMENT_VERIFICATION_FEE = {
  purpose: "CV_DOCUMENT_VERIFICATION",
  displayName: "CV & Document Verification Fee",
  currency: "KES",
  amount: 2000,
  description:
    "This fee covers system processing, CV review, document verification, application record preparation and submission processing. It is not payment for employment, sponsorship, visa approval or guaranteed placement.",
  transactionDescription: "CV Document Verification",
} as const;

export function paymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === "true";
}

export function paymentConfigurationState() {
  const required = [
    "DARAJA_CONSUMER_KEY",
    "DARAJA_CONSUMER_SECRET",
    "DARAJA_SHORTCODE",
    "DARAJA_PASSKEY",
    "DARAJA_TRANSACTION_TYPE",
    "DARAJA_CALLBACK_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    paymentsEnabled: paymentsEnabled(),
    darajaConfigured: missing.length === 0,
    missing,
  };
}

export function darajaEnvironment() {
  return process.env.DARAJA_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
}

export function darajaBaseUrl() {
  return darajaEnvironment() === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}
