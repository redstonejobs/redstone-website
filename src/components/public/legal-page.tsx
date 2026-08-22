import { Band, Hero } from "./sections";

export function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <>
      <Hero eyebrow="Red Stone" title={title} body="Plain-language website information. Final legal content should be reviewed before production launch." />
      <Band>
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-2xl font-black text-[#071A3D]">{heading}</h2>
              <p className="mt-3 leading-7 text-slate-700">{body}</p>
            </section>
          ))}
        </div>
      </Band>
    </>
  );
}

