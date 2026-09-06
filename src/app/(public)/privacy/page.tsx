import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: canonical("/privacy") } };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={[
    ["Data Collected", "Red Stone may collect recruitment, account, application, document, employer, payment-reference, support and contact-enquiry information submitted through official channels. The exact information depends on the service, vacancy, destination and stage of recruitment."],
    ["Use of Data", "Information is used for legitimate recruitment coordination, candidate communication, employer services, document and eligibility support, security, fraud prevention, compliance, payments administration, complaints and other related operational purposes."],
    ["Documents and Sensitive Data", "Recruitment documents may contain sensitive personal information. Red Stone should collect and disclose only what is reasonably necessary for the relevant recruitment or compliance purpose and should use stricter safeguards for sensitive information."],
    ["Sharing and International Recruitment", "Relevant personal data may need to be shared with employers, service providers, professional bodies or competent authorities where required for recruitment, work authorization, compliance or another lawful purpose. International transfers should use the safeguards required by applicable data-protection law."],
    ["Infrastructure", "The website uses Supabase and cloud infrastructure to operate authentication, database, storage and forms. Technology providers should receive access only to the extent needed to provide the relevant service under appropriate security and contractual controls."],
    ["Cookies", "Essential cookies may support authentication and site operation. Non-essential analytics or marketing cookies should be used only with suitable transparency and consent controls where required."],
    ["Security and Retention", "Red Stone should apply appropriate technical and organizational safeguards and should keep identifiable personal data only for as long as necessary for the relevant purpose or a legitimate legal, accounting, security, dispute, safeguarding or regulatory requirement."],
    ["Your Data Protection Rights", "People can request information about processing, access, correction, objection, restriction, portability or deletion where available under applicable law. Use the official Data Protection page at /data-protection or the Account Deletion page at /account-deletion for the relevant request."],
  ]} />;
}
