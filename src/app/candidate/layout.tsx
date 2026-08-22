import { CandidateShell } from "@/components/candidate/candidate-shell";
import { requireCandidate } from "@/lib/candidate/auth";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const context = await requireCandidate();
  return <CandidateShell context={context}>{children}</CandidateShell>;
}

