import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("ethical-recruitment");

export const metadata: Metadata = {
  title: "Ethical Recruitment",
  description: page.description,
  alternates: { canonical: canonical("/ethical-recruitment") },
};

export default function EthicalRecruitmentPage() {
  return <CompanyInfoPage page={page} />;
}
