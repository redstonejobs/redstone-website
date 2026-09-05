import { getCandidatePaymentByReference } from "@/lib/payments/application-payments";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ reference: string }>;
};

export async function GET(_request: Request, context: Context) {
  const { reference } = await context.params;
  const { payment } = await getCandidatePaymentByReference(reference);

  if (!payment) {
    return Response.json({ error: "Payment not found." }, { status: 404 });
  }

  return Response.json({
    reference: payment.internal_reference,
    purpose: payment.purpose,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    message: payment.result_description,
    receiptNumber: payment.receipt_number,
    receiptIssuedAt: payment.receipt_issued_at,
    paidAt: payment.paid_at,
    failedAt: payment.failed_at,
    updatedAt: payment.updated_at,
  });
}

