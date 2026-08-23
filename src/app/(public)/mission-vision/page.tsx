import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("mission-vision");

export const metadata: Metadata = {
  title: "Mission & Vision",
  description: page.description,
  alternates: { canonical: canonical("/mission-vision") },
};

export default function MissionVisionPage() {
  return <CompanyInfoPage page={page} />;
}
