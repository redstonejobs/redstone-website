import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: canonical("/privacy") } };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={[
    ["Data Collected", "Red Stone may collect recruitment, account, application, document, employer and contact enquiry information submitted through official channels."],
    ["Use of Data", "Information is used to support recruitment coordination, candidate communication, employer services, security, compliance and operational administration."],
    ["Documents", "Recruitment documents may contain sensitive personal information and should only be submitted through approved official channels."],
    ["Infrastructure", "The website uses Supabase and cloud infrastructure to operate authentication, database, storage and forms."],
    ["Cookies", "Essential cookies may support authentication and site operation. Non-essential analytics or marketing cookies should be added only with suitable consent controls."],
    ["Security and Retention", "Red Stone should apply appropriate safeguards and retention practices. Final legal copy should be reviewed before production launch."],
  ]} />;
}

