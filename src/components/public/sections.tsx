import Link from "next/link";

export function Hero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-[#071A3D] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=80')",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid min-h-[560px] max-w-7xl content-center gap-8 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {eyebrow ? <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F2D675]">{eyebrow}</p> : null}
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primary ? <Link href={primary.href} className="rounded-md bg-[#D4AF37] px-6 py-4 text-center text-sm font-black text-[#071A3D]">{primary.label}</Link> : null}
            {secondary ? <Link href={secondary.href} className="rounded-md border border-white/40 px-6 py-4 text-center text-sm font-black text-white">{secondary.label}</Link> : null}
          </div>
        </div>
        <div className="hidden self-end rounded-md border border-white/20 bg-white/10 p-6 backdrop-blur lg:block">
          <p className="text-sm font-bold uppercase tracking-wide text-[#F2D675]">Recruitment with care</p>
          <div className="mt-5 grid gap-4">
            {["Ethical Recruitment", "Candidate Support", "Employer Screening", "International Opportunities"].map((item) => (
              <div key={item} className="rounded-md border border-white/15 bg-white/10 p-4 text-sm font-semibold">{item}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-black text-[#071A3D] sm:text-4xl">{title}</h2>
      {body ? <p className="mt-4 text-base leading-7 text-slate-600">{body}</p> : null}
    </div>
  );
}

export function Band({ children, tone = "white" }: { children: React.ReactNode; tone?: "white" | "grey" | "navy" }) {
  const classes = tone === "navy" ? "bg-[#071A3D] text-white" : tone === "grey" ? "bg-[#F3F4F6]" : "bg-white";
  return <section className={`${classes} px-4 py-16 sm:py-20`}><div className="mx-auto max-w-7xl">{children}</div></section>;
}

export function InfoGrid({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-[#071A3D]">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function ProcessSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-sm font-black text-[#B8860B]">Step {index + 1}</span>
          <p className="mt-2 font-black text-[#071A3D]">{step}</p>
        </li>
      ))}
    </ol>
  );
}

export function ContactCTA() {
  return (
    <Band tone="navy">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F2D675]">Speak with Red Stone</p>
          <h2 className="mt-2 text-3xl font-black text-white">Ready for responsible recruitment support?</h2>
          <p className="mt-3 max-w-2xl text-slate-200">Use official Red Stone channels for job, employer, support and complaint enquiries.</p>
        </div>
        <Link href="/contact" className="rounded-md bg-[#D4AF37] px-6 py-4 text-center text-sm font-black text-[#071A3D]">Contact Red Stone</Link>
      </div>
    </Band>
  );
}
