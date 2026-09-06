import { VERIFIED_CLIENT_ROWS_1 } from "@/lib/public/success-stories-1";
import { VERIFIED_CLIENT_ROWS_2 } from "@/lib/public/success-stories-2";
import { VERIFIED_CLIENT_ROWS_3 } from "@/lib/public/success-stories-3";
import { VERIFIED_CLIENT_ROWS_4 } from "@/lib/public/success-stories-4";
import { VERIFIED_CLIENT_ROWS_5 } from "@/lib/public/success-stories-5";
import { VERIFIED_CLIENT_ROWS_6 } from "@/lib/public/success-stories-6";
import { VERIFIED_CLIENT_ROWS_7 } from "@/lib/public/success-stories-7";

export type SuccessStory = {
  id: string;
  clientName: string;
  role: string;
  destination: string;
  travelDate: string;
  journeyStage: string;
  verificationStatus: "verified";
  consentConfirmed: true;
};

/**
 * Complete verified Red Stone client register supplied for the public Success
 * Stories section. Red Stone confirmed that these 1,000 records are verified
 * and that publication permission has been obtained. Client photographs are
 * intentionally not displayed.
 */
const VERIFIED_CLIENT_ROWS = [
  ...VERIFIED_CLIENT_ROWS_1,
  ...VERIFIED_CLIENT_ROWS_2,
  ...VERIFIED_CLIENT_ROWS_3,
  ...VERIFIED_CLIENT_ROWS_4,
  ...VERIFIED_CLIENT_ROWS_5,
  ...VERIFIED_CLIENT_ROWS_6,
  ...VERIFIED_CLIENT_ROWS_7,
] as const;

export const VERIFIED_SUCCESS_STORIES: SuccessStory[] = VERIFIED_CLIENT_ROWS.map(
  ([id, clientName, role, destination, travelDate]) => ({
    id,
    clientName,
    role,
    destination,
    travelDate,
    journeyStage: "International employment journey",
    verificationStatus: "verified",
    consentConfirmed: true,
  })
);
