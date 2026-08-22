import { EmployerProfileForm } from "@/components/employer/profile-form";
import { updateEmployerProfile } from "@/lib/employer/actions";
import { requireEmployer } from "@/lib/employer/auth";
import { textValue } from "@/lib/admin/format";

export default async function EmployerProfilePage() {
  const context = await requireEmployer();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#071A3D]">Company Profile</h1>
        <p className="mt-2 text-slate-600">You can edit safe company fields. Verification status, ownership and internal Red Stone fields are protected.</p>
        <p className="mt-2 text-sm font-semibold capitalize text-[#B8860B]">Verification: {textValue(context.employer, ["verification_status"], "pending").replaceAll("_", " ")}</p>
      </div>
      <EmployerProfileForm employer={context.employer} action={updateEmployerProfile} submitLabel="Save Profile" />
    </div>
  );
}
