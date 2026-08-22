import { updateEmployerProfile, submitCompanyVerification } from "@/lib/employer/actions";
import { requireEmployer } from "@/lib/employer/auth";
import { EmployerProfileForm } from "@/components/employer/profile-form";

export default async function EmployerOnboardingPage() {
  const context = await requireEmployer();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#071A3D]">Company Onboarding</h1>
        <p className="mt-2 text-slate-600">Complete your company profile, then submit it for Red Stone verification.</p>
      </div>
      <EmployerProfileForm employer={context.employer} action={updateEmployerProfile} submitLabel="Save Company Profile" />
      <form action={submitCompanyVerification} className="rounded-md border border-[#D4AF37] bg-[#FFF8DF] p-5">
        <h2 className="text-lg font-black text-[#071A3D]">Submit for Verification</h2>
        <p className="mt-2 text-sm text-slate-700">Red Stone staff will review your company information. Submission does not verify the company automatically.</p>
        <button className="mt-4 rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Submit Verification</button>
      </form>
    </div>
  );
}
