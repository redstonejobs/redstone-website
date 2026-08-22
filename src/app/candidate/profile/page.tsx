import { updateCandidateProfile } from "@/lib/candidate/actions";
import { requireCandidate } from "@/lib/candidate/auth";

export default async function CandidateProfilePage() {
  const context = await requireCandidate();
  const profile = context.profile;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-black text-[#071A3D]">Profile</h1>
      <p className="mt-2 text-slate-600">You can update safe profile fields used for candidate support.</p>
      <form action={updateCandidateProfile} className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="full_name" label="Full Name" defaultValue={profile.full_name} required />
          <Field name="phone" label="Phone" defaultValue={profile.phone} required />
          <Field name="nationality" label="Nationality" defaultValue={profile.nationality} required />
          <Field name="date_of_birth" label="Date of Birth" type="date" defaultValue={profile.date_of_birth} required />
          <Field name="city" label="Current City" defaultValue={profile.city} required />
          <Field name="country" label="Current Country" defaultValue={profile.country} required />
        </div>
        <button className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Save Profile</button>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text", required = false }: { name: string; label: string; defaultValue?: string | null; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-bold text-slate-700">{label}<input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>;
}

