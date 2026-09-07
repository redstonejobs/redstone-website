import { redirect } from "next/navigation";

/**
 * Generic Apply entry cannot create an application without a real published
 * vacancy. Send candidates to confirmed sponsorship vacancies so they choose a
 * real sponsored job before the /apply/[slug] candidate workflow starts.
 */
export default function ApplyPage() {
  redirect("/jobs?sponsorship=confirmed&sort=newest");
}
