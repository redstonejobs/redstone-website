export type SuccessStory = {
  id: string;
  clientName: string;
  role: string;
  destination: string;
  journeyStage: string;
  story: string;
  outcome: string;
  publishedAt: string;
  verificationStatus: "verified";
  consentConfirmed: true;
};

/**
 * Public success stories must be backed by Red Stone records and explicit
 * publication consent. Do not add generated names, invented placements,
 * sample journeys, or unverified quotes to this collection.
 */
export const VERIFIED_SUCCESS_STORIES: SuccessStory[] = [];
