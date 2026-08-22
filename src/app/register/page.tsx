import Link from "next/link";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { registerCandidate } from "@/lib/auth/actions";

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function RegisterPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-10">
      <form action={registerCandidate} className="mx-auto grid max-w-2xl gap-5 rounded-md bg-white p-8 shadow-xl">
        <div>
          <RedstoneLogo
            href="/"
            size="lg"
            showText
            subtitle="Candidate Registration"
            priority
            className="mb-6 text-[#071A3D]"
            textClassName="text-[#071A3D]"
          />
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Create your Red Stone account</h1>
        </div>
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="full_name" label="Full Name" required />
          <Field name="email" label="Email" type="email" required />
          <Field name="password" label="Password" type="password" required />
          <Field name="confirm_password" label="Confirm Password" type="password" required />
          <Field name="phone" label="Phone" required />
          <Field name="nationality" label="Nationality" required />
          <Field name="date_of_birth" label="Date of Birth" type="date" required />
          <Field name="city" label="Current City" required />
          <Field name="country" label="Current Country" required />
        </div>
        <label className="flex gap-2 text-sm font-semibold"><input type="checkbox" name="privacy" required /> I acknowledge the Privacy Policy.</label>
        <label className="flex gap-2 text-sm font-semibold"><input type="checkbox" name="terms" required /> I acknowledge the Terms.</label>
        <button className="rounded-md bg-[#D4AF37] px-5 py-3 font-black text-[#071A3D]">Register</button>
        <Link href="/login" className="text-sm font-bold text-[#071A3D]">Already have an account? Sign in</Link>
      </form>
    </main>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input name={name} type={type} required={required} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
    </label>
  );
}
