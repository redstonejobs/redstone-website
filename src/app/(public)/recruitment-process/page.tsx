import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("recruitment-process");

export const metadata: Metadata = {
  title: "Recruitment Process",
  description: page.description,
  alternates: { canonical: canonical("/recruitment-process") },
};

export default function RecruitmentProcessPage() {
  return <CompanyInfoPage page={page} />;
}
