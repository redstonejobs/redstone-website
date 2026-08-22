import type { Metadata } from "next";
import { Band, Hero } from "@/components/public/sections";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Testimonials", description: "Verified Red Stone candidate and employer stories when authorized.", alternates: { canonical: canonical("/testimonials") } };

export default function TestimonialsPage() {
  return (
    <>
      <Hero eyebrow="Verified stories" title="Candidate and employer testimonials." body="Red Stone publishes testimonials only when reviews are verified and authorized." />
      <Band>
        <div className="mx-auto max-w-2xl rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-black text-[#071A3D]">Verified success stories will be published here as candidates and employers authorize their reviews.</h1>
          <p className="mt-4 text-slate-600">No fake names, reviews, placement countries or client quotes have been added.</p>
        </div>
      </Band>
    </>
  );
}

