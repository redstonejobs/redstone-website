import Link from "next/link";
import { Band, ContactCTA, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import type { CompanyPageContent } from "@/lib/public/company-pages";
import { trustNavigation } from "@/lib/public/company-pages";
import { SITE_NAME, SITE_URL } from "@/lib/public/site";

export function CompanyInfoPage({ page }: { page: CompanyPageContent }) {
  const related = trustNavigation.filter((item) => item.href !== `/${page.slug}`);

  return (
    <>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        body={page.intro}
        primary={{ label: "Official Channels", href: "/official-channels" }}
        secondary={{ label: "Contact Red Stone", href: "/contact" }}
      />
      <BreadcrumbJsonLd page={page} />
      <Band>
        <SectionHeading
          eyebrow="Company information"
          title={page.navTitle}
          body={page.description}
        />
        <div className="mt-10">
          <InfoGrid items={page.sections} />
        </div>
      </Band>
      {page.process?.length ? (
        <Band tone="grey">
          <SectionHeading
            eyebrow="Process"
            title="How this works in practice"
            body="Each stage is a coordination point. Moving forward in the process does not guarantee employment, work authorization or travel approval."
          />
          <div className="mt-10">
            <ProcessSteps steps={page.process} />
          </div>
        </Band>
      ) : null}
      {page.callouts?.length ? (
        <Band tone="grey">
          <div className="grid gap-4 md:grid-cols-2">
            {page.callouts.map((item) => (
              <article key={item.title} className="rounded-md border border-[#D4AF37]/40 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </Band>
      ) : null}
      <Band>
        <SectionHeading
          eyebrow="Explore more"
          title="Company, trust and safety pages"
          body="Use these pages to understand Red Stone's recruitment approach, safety guidance and official communication channels."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-slate-200 bg-white p-4 text-sm font-bold text-[#071A3D] shadow-sm transition hover:border-[#D4AF37] hover:text-[#B8860B]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Band>
      <ContactCTA />
    </>
  );
}

function BreadcrumbJsonLd({ page }: { page: CompanyPageContent }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.navTitle,
        item: `${SITE_URL}/${page.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
