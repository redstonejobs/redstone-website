import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("why-red-stone");

export const metadata: Metadata = {
  title: "Why Red Stone",
  description: page.description,
  alternates: { canonical: canonical("/why-red-stone") },
};

export default function WhyRedStonePage() {
  return <CompanyInfoPage page={page} />;
}
