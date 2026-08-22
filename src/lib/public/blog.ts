export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  sections: { heading: string; body: string }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "prepare-overseas-job-interview",
    title: "How to Prepare for an Overseas Job Interview",
    description: "Practical interview preparation for candidates applying to international employers.",
    date: "2026-08-22",
    category: "Candidate Guidance",
    readingTime: "4 min read",
    sections: [
      { heading: "Know the role", body: "Review the vacancy carefully and prepare examples that show relevant experience, reliability and communication skills." },
      { heading: "Prepare your documents", body: "Keep your CV, certificates and references consistent. Employers may ask about dates, duties and previous workplaces." },
      { heading: "Be honest", body: "Do not exaggerate experience or qualifications. Responsible recruitment depends on accurate information." },
    ],
  },
  {
    slug: "recruitment-scam-warning-signs",
    title: "Recruitment Scam Warning Signs",
    description: "How candidates can identify suspicious job offers and protect their documents.",
    date: "2026-08-22",
    category: "Fraud Awareness",
    readingTime: "5 min read",
    sections: [
      { heading: "Verify channels", body: "Check that communication uses official Red Stone contact channels and contact the agency directly when unsure." },
      { heading: "Question pressure", body: "Be cautious of urgent payment demands, vague job details or promises of guaranteed visas." },
      { heading: "Protect records", body: "Do not send sensitive documents to unverified contacts or social media impersonators." },
    ],
  },
  {
    slug: "documents-for-international-recruitment",
    title: "Documents Commonly Needed for International Recruitment",
    description: "A general guide to records candidates may need during a professional recruitment process.",
    date: "2026-08-22",
    category: "Documents",
    readingTime: "4 min read",
    sections: [
      { heading: "Identity and profile", body: "Candidates are commonly asked for identity documents, contact information and a current CV." },
      { heading: "Experience evidence", body: "Employment letters, certificates and references can help employers assess suitability." },
      { heading: "Requirements vary", body: "Specific documents depend on the employer, role and relevant authorities. Always verify current instructions." },
    ],
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

