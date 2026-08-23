import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("safety");

export const metadata: Metadata = {
  title: "Safety",
  description: page.description,
  alternates: { canonical: canonical("/safety") },
};

export default function SafetyPage() {
  return <CompanyInfoPage page={page} />;
}
