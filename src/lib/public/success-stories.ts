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
 * Featured verified Red Stone client journeys selected from the agency-supplied
 * client register for public display. Red Stone confirmed that these records are
 * verified and that publication permission has been obtained.
 *
 * No testimonial quotes are invented. The public slider shows only supplied
 * client identity, role, destination and journey-date details.
 */
export const VERIFIED_SUCCESS_STORIES: SuccessStory[] = [
  { id: "client-0975", clientName: "Caroline Nyambura", role: "Construction Worker", destination: "Australia", travelDate: "2026-06-05", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0979", clientName: "Nancy Chebet", role: "Cook", destination: "Bahrain", travelDate: "2026-06-07", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0950", clientName: "Charles Mutua", role: "Warehouse Assistant", destination: "Canada", travelDate: "2026-05-12", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0990", clientName: "Yvonne Njeri", role: "Cleaner", destination: "Finland", travelDate: "2026-06-22", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0955", clientName: "Josephine Bochaberi", role: "Electrician", destination: "Germany", travelDate: "2026-05-17", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0997", clientName: "Maureen Ouma", role: "Hairdresser", destination: "Ireland", travelDate: "2026-06-29", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0978", clientName: "Julius Muli", role: "Factory Worker", destination: "Japan", travelDate: "2026-06-06", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0949", clientName: "Richard Bett", role: "Chef", destination: "Kuwait", travelDate: "2026-05-12", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0998", clientName: "Nicholas Makori", role: "Laundry Attendant", destination: "Netherlands", travelDate: "2026-06-29", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0983", clientName: "Elizabeth Chebet", role: "Welder", destination: "New Zealand", travelDate: "2026-06-11", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0981", clientName: "Rebecca Nyanchama", role: "Driver", destination: "Oman", travelDate: "2026-06-09", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0987", clientName: "Jackson Bii", role: "Teaching Assistant", destination: "Poland", travelDate: "2026-06-20", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-1000", clientName: "Mark Khayesi", role: "Security Guard", destination: "Qatar", travelDate: "2026-06-30", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0988", clientName: "Victoria Kwamboka", role: "Painter", destination: "Romania", travelDate: "2026-06-20", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0992", clientName: "Joan Wekesa", role: "Farm Worker", destination: "Saudi Arabia", travelDate: "2026-06-25", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0985", clientName: "Caleb Mutiso", role: "Nurse", destination: "Singapore", travelDate: "2026-06-13", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0999", clientName: "Charles Rono", role: "Driver", destination: "Sweden", travelDate: "2026-06-29", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0963", clientName: "Vincent Karanja", role: "IT Support Technician", destination: "USA", travelDate: "2026-05-27", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0989", clientName: "Emmanuel Kipchoge", role: "Factory Worker", destination: "United Arab Emirates", travelDate: "2026-06-20", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
  { id: "client-0962", clientName: "Dennis Mutiso", role: "Hotel Receptionist", destination: "United Kingdom", travelDate: "2026-05-26", journeyStage: "International employment journey", verificationStatus: "verified", consentConfirmed: true },
];
