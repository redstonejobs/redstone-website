import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] px-4">
      <div className="max-w-lg rounded-md bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-black text-[#071A3D]">Check your email</h1>
        <p className="mt-4 text-slate-600">If Supabase email verification is enabled, use the secure verification link sent to your email before signing in. If verification is not required, you may be able to sign in immediately.</p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-[#D4AF37] px-5 py-3 font-black text-[#071A3D]">Go to Login</Link>
      </div>
    </main>
  );
}
