import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("compliance");

export const metadata: Metadata = {
  title: "Compliance",
  description: page.description,
  alternates: { canonical: canonical("/compliance") },
};

export default function CompliancePage() {
  return <CompanyInfoPage page={page} />;
}
