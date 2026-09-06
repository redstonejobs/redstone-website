import { processMpesaCallbackPayload } from "@/lib/payments/application-payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const result = await processMpesaCallbackPayload(payload);

  return Response.json(
    {
      ok: result.ok,
      message: result.message,
    },
    { status: result.status }
  );
}
