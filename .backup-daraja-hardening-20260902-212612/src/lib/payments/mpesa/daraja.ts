import "server-only";

import {
  CV_DOCUMENT_VERIFICATION_FEE,
  darajaBaseUrl,
  paymentConfigurationState,
  paymentsEnabled,
} from "@/lib/payments/config";

type DarajaToken = {
  accessToken: string;
  expiresAt: number;
};

type StkPushInput = {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  callbackUrl: string;
};

type StkQueryInput = {
  checkoutRequestId: string;
};

let cachedToken: DarajaToken | null = null;

export async function getDarajaAccessToken() {
  assertDarajaReady();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
  const authorization = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(
    `${darajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${authorization}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("M-Pesa authorization is unavailable.");
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: string | number;
  };

  if (!payload.access_token) {
    throw new Error("M-Pesa authorization response was invalid.");
  }

  const ttlSeconds = Number(payload.expires_in ?? 3600);
  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Math.max(300, ttlSeconds - 60) * 1000,
  };

  return cachedToken.accessToken;
}

export async function initiateDarajaStkPush(input: StkPushInput) {
  assertDarajaReady();

  const shortcode = process.env.DARAJA_SHORTCODE!;
  const passkey = process.env.DARAJA_PASSKEY!;
  const transactionType =
    process.env.DARAJA_TRANSACTION_TYPE ?? "CustomerPayBillOnline";
  const timestamp = darajaTimestamp();
  const password = btoa(`${shortcode}${passkey}${timestamp}`);
  const accessToken = await getDarajaAccessToken();

  const response = await fetch(
    `${darajaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: input.amount,
        PartyA: input.phoneNumber,
        PartyB: shortcode,
        PhoneNumber: input.phoneNumber,
        CallBackURL: input.callbackUrl,
        AccountReference: input.accountReference,
        TransactionDesc: CV_DOCUMENT_VERIFICATION_FEE.transactionDescription,
      }),
    }
  );

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new Error("M-Pesa payment request could not be started.");
  }

  return {
    merchantRequestId: text(payload.MerchantRequestID),
    checkoutRequestId: text(payload.CheckoutRequestID),
    responseCode: text(payload.ResponseCode),
    responseDescription: text(payload.ResponseDescription),
    customerMessage: text(payload.CustomerMessage),
  };
}

export async function queryDarajaStkPushStatus(input: StkQueryInput) {
  assertDarajaReady();

  const shortcode = process.env.DARAJA_SHORTCODE!;
  const passkey = process.env.DARAJA_PASSKEY!;
  const timestamp = darajaTimestamp();
  const password = btoa(`${shortcode}${passkey}${timestamp}`);
  const accessToken = await getDarajaAccessToken();

  const response = await fetch(
    `${darajaBaseUrl()}/mpesa/stkpushquery/v1/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: input.checkoutRequestId,
      }),
    }
  );

  const payload = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new Error("M-Pesa payment verification is unavailable.");
  }

  return {
    merchantRequestId: text(payload.MerchantRequestID),
    checkoutRequestId: text(payload.CheckoutRequestID),
    responseCode: text(payload.ResponseCode),
    responseDescription: text(payload.ResponseDescription),
    resultCode:
      typeof payload.ResultCode === "number"
        ? String(payload.ResultCode)
        : text(payload.ResultCode),
    resultDescription: text(payload.ResultDesc),
  };
}

function assertDarajaReady() {
  const state = paymentConfigurationState();

  if (!paymentsEnabled() || !state.darajaConfigured) {
    throw new Error("Payment service is being configured.");
  }
}

function darajaTimestamp() {
  const date = new Date();
  const parts = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  return parts
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, "0")
    )
    .join("");
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
