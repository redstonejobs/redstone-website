import type { Metadata } from "next";
import { CompanyInfoPage } from "@/components/public/company-info-page";
import { getCompanyPage } from "@/lib/public/company-pages";
import { canonical } from "@/lib/public/site";

const page = getCompanyPage("official-channels");

export const metadata: Metadata = {
  title: "Official Channels",
  description: page.description,
  alternates: { canonical: canonical("/official-channels") },
};

export default function OfficialChannelsPage() {
  return <CompanyInfoPage page={page} />;
}
