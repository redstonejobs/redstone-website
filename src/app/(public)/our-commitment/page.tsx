import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("our-commitment");

export const metadata: Metadata = {
  title: "Our Commitment",
  description: page.description,
  alternates: { canonical: canonical("/our-commitment") },
};

export default function OurCommitmentPage() {
  return <CompanyInfoPage page={page} />;
}
