import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("employer-services");

export const metadata: Metadata = {
  title: "Employer Services",
  description: page.description,
  alternates: { canonical: canonical("/employer-services") },
};

export default function EmployerServicesPage() {
  return <CompanyInfoPage page={page} />;
}
