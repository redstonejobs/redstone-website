import { redirect } from "next/navigation";

/** Generic Apply entry never creates anonymous applications. */
export default function ApplyPage() {
  redirect("/jobs");
}
