import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Terms of Use", alternates: { canonical: canonical("/terms") } };

export default function TermsPage() {
  return <LegalPage title="Terms of Use" sections={[
    ["Website Use", "Use this website responsibly and do not attempt to access private systems, documents, staff records or application data."],
    ["Recruitment Applications", "Candidates are responsible for providing accurate information and documents."],
    ["No Guarantee", "Red Stone does not guarantee employment, employer selection, work permits, visas or immigration approval."],
    ["Employer Responsibilities", "Employers are responsible for accurate vacancy requirements and lawful recruitment practices."],
    ["External Links", "External resources may change and should be verified independently."],
    ["Legal Review", "These terms are operational website copy and should be reviewed by qualified counsel before production launch."],
  ]} />;
}

