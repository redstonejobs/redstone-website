export type CountryVisual = {
  slug: string;
  flag: string;
  landmark: string;
  landmarkNote: string;
};

export const COUNTRY_VISUALS: CountryVisual[] = [
  { slug: "united-states", flag: "🇺🇸", landmark: "Statue of Liberty", landmarkNote: "New York" },
  { slug: "canada", flag: "🇨🇦", landmark: "CN Tower", landmarkNote: "Toronto" },
  { slug: "uae", flag: "🇦🇪", landmark: "Burj Khalifa", landmarkNote: "Dubai" },
  { slug: "qatar", flag: "🇶🇦", landmark: "Doha Corniche", landmarkNote: "Doha" },
  { slug: "kuwait", flag: "🇰🇼", landmark: "Kuwait Towers", landmarkNote: "Kuwait City" },
  { slug: "bahrain", flag: "🇧🇭", landmark: "Bahrain World Trade Center", landmarkNote: "Manama" },
  { slug: "oman", flag: "🇴🇲", landmark: "Sultan Qaboos Grand Mosque", landmarkNote: "Muscat" },
  { slug: "australia", flag: "🇦🇺", landmark: "Sydney Opera House", landmarkNote: "Sydney" },
  { slug: "new-zealand", flag: "🇳🇿", landmark: "Sky Tower", landmarkNote: "Auckland" },
  { slug: "chile", flag: "🇨🇱", landmark: "Andes & Santiago Skyline", landmarkNote: "Santiago" },
  { slug: "peru", flag: "🇵🇪", landmark: "Machu Picchu", landmarkNote: "Cusco Region" },
  { slug: "singapore", flag: "🇸🇬", landmark: "Marina Bay Sands", landmarkNote: "Singapore" },
  { slug: "united-kingdom", flag: "🇬🇧", landmark: "Big Ben", landmarkNote: "London" },
  { slug: "germany", flag: "🇩🇪", landmark: "Brandenburg Gate", landmarkNote: "Berlin" },
  { slug: "france", flag: "🇫🇷", landmark: "Eiffel Tower", landmarkNote: "Paris" },
  { slug: "italy", flag: "🇮🇹", landmark: "Colosseum", landmarkNote: "Rome" },
  { slug: "netherlands", flag: "🇳🇱", landmark: "Amsterdam Canal Houses", landmarkNote: "Amsterdam" },
  { slug: "switzerland", flag: "🇨🇭", landmark: "Matterhorn", landmarkNote: "Swiss Alps" },
  { slug: "sweden", flag: "🇸🇪", landmark: "Stockholm City Hall", landmarkNote: "Stockholm" },
  { slug: "norway", flag: "🇳🇴", landmark: "Oslo Opera House", landmarkNote: "Oslo" },
  { slug: "denmark", flag: "🇩🇰", landmark: "Nyhavn", landmarkNote: "Copenhagen" },
  { slug: "finland", flag: "🇫🇮", landmark: "Helsinki Cathedral", landmarkNote: "Helsinki" },
  { slug: "poland", flag: "🇵🇱", landmark: "Palace of Culture and Science", landmarkNote: "Warsaw" },
  { slug: "austria", flag: "🇦🇹", landmark: "Schönbrunn Palace", landmarkNote: "Vienna" },
  { slug: "ireland", flag: "🇮🇪", landmark: "Cliffs of Moher", landmarkNote: "County Clare" },
  { slug: "luxembourg", flag: "🇱🇺", landmark: "Adolphe Bridge", landmarkNote: "Luxembourg City" },
];

export function getCountryVisual(slug: string) {
  return COUNTRY_VISUALS.find((item) => item.slug === slug) ?? {
    slug,
    flag: "🌍",
    landmark: "International destination",
    landmarkNote: "Red Stone recruitment market",
  };
}
