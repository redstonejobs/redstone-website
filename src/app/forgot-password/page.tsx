import { requestPasswordReset } from "@/lib/auth/actions";

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] px-4">
      <form action={requestPasswordReset} className="w-full max-w-md rounded-md bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-[#071A3D]">Reset Password</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your email. If the account can receive reset email, Supabase will send secure instructions.</p>
        {params.sent ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">If an account is eligible, reset instructions have been sent.</p> : null}
        {params.error && typeof params.error === "string" ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
        <label className="mt-5 grid gap-2 text-sm font-bold">
          Email
          <input name="email" type="email" required className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
        </label>
        <button className="mt-5 w-full rounded-md bg-[#D4AF37] px-5 py-3 font-black text-[#071A3D]">Send Reset Link</button>
      </form>
    </main>
  );
}

