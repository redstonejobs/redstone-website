import Link from "next/link";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { registerEmployer } from "@/lib/employer/actions";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function EmployerRegisterPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <main className="min-h-screen bg-[#071A3D] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-md bg-white p-6 shadow-2xl">
        <RedstoneLogo
          href="/"
          size="lg"
          showText
          subtitle="Employer Registration"
          priority
          className="mb-6 text-[#071A3D]"
          textClassName="text-[#071A3D]"
        />
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Create a Red Stone employer account</h1>
        <p className="mt-3 text-sm text-slate-600">Company verification remains controlled by Red Stone. Registration does not approve or publish vacancies automatically.</p>
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{decodeURIComponent(error)}</p> : null}
        <form action={registerEmployer} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field name="company_name" label="Company Name" required />
          <Field name="contact_name" label="Contact Person Full Name" required />
          <Field name="email" label="Business Email" type="email" required />
          <Field name="phone" label="Phone" required />
          <Field name="password" label="Password" type="password" required />
          <Field name="confirm_password" label="Confirm Password" type="password" required />
          <Field name="country" label="Country" required />
          <Field name="city" label="City" required />
          <Field name="website" label="Website" />
          <Field name="registration_number" label="Registration Number" required />
          <Field name="company_type" label="Company Type" />
          <Field name="industry" label="Industry" required />
          <Field name="company_size" label="Approximate Company Size" />
          <label className="flex gap-2 text-sm font-semibold text-slate-700 md:col-span-2"><input name="privacy" type="checkbox" required /> I acknowledge Red Stone&apos;s <Link href="/privacy" className="text-[#B8860B]">Privacy Policy</Link>.</label>
          <label className="flex gap-2 text-sm font-semibold text-slate-700 md:col-span-2"><input name="terms" type="checkbox" required /> I accept the <Link href="/terms" className="text-[#B8860B]">Terms</Link> and confirm this company information is accurate.</label>
          <button className="min-h-11 rounded-md bg-[#D4AF37] px-5 font-black text-[#071A3D] md:col-span-2">Create Employer Account</button>
        </form>
        <p className="mt-5 text-sm font-semibold"><Link href="/login" className="text-[#071A3D]">Already registered? Sign in</Link></p>
      </div>
    </main>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}<input name={name} type={type} required={required} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></label>;
}
