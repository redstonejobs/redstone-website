import { redirect } from "next/navigation";

/**
 * Generic Apply entry cannot create an application without a real published
 * vacancy. Send candidates to the lightweight sponsored-vacancy list so they
 * can choose a real job before the /apply/[slug] flow starts.
 */
export default function ApplyPage() {
  redirect("/jobs?sponsorship=true&sort=newest");
}
