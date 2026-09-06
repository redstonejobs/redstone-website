export const SITE_URL = "https://redstone.co.ke";
export const SITE_NAME = "Red Stone Employment Agency";

export const CONTACT = {
  phones: ["+254 180 145985", "+254 180 129932"],
  emails: {
    general: "info@redstone.co.ke",
    jobs: "jobs@redstone.co.ke",
    support: "support@redstone.co.ke",
    hr: "hr@redstone.co.ke",
    visa: "visa@redstone.co.ke",
    admin: "admin@redstone.co.ke",
    noreply: "noreply@redstone.co.ke",
  },
};

export const SOCIAL_CHANNELS = [
  {
    platform: "Facebook",
    label: "RedstoneGlobalJobs",
    href: "https://www.facebook.com/RedstoneGlobalJobs",
  },
  {
    platform: "Facebook",
    label: "RedstoneJobs",
    href: "https://www.facebook.com/RedstoneJobs",
  },
  {
    platform: "Facebook",
    label: "redstoneagency1",
    href: "https://www.facebook.com/redstoneagency1",
  },
  {
    platform: "Instagram",
    label: "@redtoneimmigration",
    href: "https://www.instagram.com/redtoneimmigration/",
  },
  {
    platform: "TikTok",
    label: "@jayconsultantsglobal",
    href: "https://www.tiktok.com/@jayconsultantsglobal",
  },
] as const;

export const WHATSAPP_CHANNELS = [
  { label: "WhatsApp Main", display: "0748 302 420", number: "254748302420" },
  { label: "WhatsApp Line 2", display: "+254 180 145989", number: "254180145989" },
  { label: "WhatsApp Line 3", display: "+254 180 129932", number: "254180129932" },
  { label: "WhatsApp Line 4", display: "+254 180 145991", number: "254180145991" },
  { label: "WhatsApp Line 5", display: "+254 180 145993", number: "254180145993" },
] as const;

export const RECRUITMENT_DISCLAIMER =
  "Job availability, employer selection, work permit and visa outcomes depend on the relevant employer and government authorities. Red Stone Employment Agency does not guarantee employment or immigration approval.";

export function canonical(path = "/") {
  return new URL(path, SITE_URL).toString();
}
