export const SITE_URL = "https://redstone.co.ke";
export const SITE_NAME = "Red Stone Employment Agency";

export const CONTACT = {
  phones: ["+254 180 145985", "+254 180 129932"],
  emails: {
    general: "info@redstone.co.ke",
    jobs: "jobs@redstone.co.ke",
    recruitment: "recruitment@redstone.co.ke",
    employers: "employers@redstone.co.ke",
    support: "support@redstone.co.ke",
    documents: "documents@redstone.co.ke",
    accounts: "accounts@redstone.co.ke",
    complaints: "complaints@redstone.co.ke",
    hr: "hr@redstone.co.ke",
    admin: "admin@redstone.co.ke",
  },
};

export const RECRUITMENT_DISCLAIMER =
  "Job availability, employer selection, work permit and visa outcomes depend on the relevant employer and government authorities. Red Stone Employment Agency does not guarantee employment or immigration approval.";

export function canonical(path = "/") {
  return new URL(path, SITE_URL).toString();
}

