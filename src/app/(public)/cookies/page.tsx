import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Cookie Policy", alternates: { canonical: canonical("/cookies") } };

export default function CookiesPage() {
  return <LegalPage title="Cookie Policy" sections={[
    ["Essential Cookies", "Essential cookies may be used for authentication, security and basic website operation."],
    ["Analytics and Marketing", "Non-essential analytics or marketing cookies should not be enabled without appropriate disclosure and consent controls."],
    ["Future Consent", "A consent banner can be added if Red Stone introduces non-essential tracking tools."],
    ["Managing Cookies", "Visitors can manage cookies through browser settings, although some essential features may be affected."],
  ]} />;
}

