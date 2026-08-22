import Link from "next/link";

export default function EmployerVerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-12">
      <section className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8860B]">Verify Email</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Check your business email</h1>
        <p className="mt-4 leading-7 text-slate-600">Supabase email verification must complete before the employer portal can confirm your account session. After verifying, sign in and continue company onboarding.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login?next=/employer/onboarding" className="rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Employer Login</Link>
          <Link href="/employers" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Back to Employers</Link>
        </div>
      </section>
    </main>
  );
}
