import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] px-4 py-20">
      <div className="max-w-xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">Page not found</p>
        <h1 className="mt-3 text-4xl font-black text-[#071A3D]">We could not find that page.</h1>
        <p className="mt-4 text-slate-600">Use the links below to return to official Red Stone public pages.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Home</Link>
          <Link href="/jobs" className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Browse Jobs</Link>
          <Link href="/contact" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Contact</Link>
        </div>
      </div>
    </main>
  );
}

