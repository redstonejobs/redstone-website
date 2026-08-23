import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("candidate-protection");

export const metadata: Metadata = {
  title: "Candidate Protection",
  description: page.description,
  alternates: { canonical: canonical("/candidate-protection") },
};

export default function CandidateProtectionPage() {
  return <CompanyInfoPage page={page} />;
}
