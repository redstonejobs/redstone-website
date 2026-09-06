"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#071A3D]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") ?? "";
  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get("error") === "profile_missing"
      ? "Your account profile could not be found. Please contact support."
      : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage("We could not sign you in with those details.");
      setLoading(false);
      return;
    }

    router.replace(`/auth/redirect${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-[#071A3D] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-md bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-8 text-center">
            <RedstoneLogo
              href="/"
              size="lg"
              showText
              subtitle="Secure Account Access"
              priority
              className="mx-auto justify-center text-[#071A3D]"
              textClassName="text-left text-[#071A3D]"
            />
            <h1 className="text-3xl font-bold">Secure Login</h1>
            <p className="mt-3 text-sm text-slate-600">Sign in to access your Red Stone account.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block text-sm font-medium">
              Email address
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
            </label>
            {errorMessage ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}
            <button type="submit" disabled={loading} className="w-full rounded-md bg-[#D4AF37] px-5 py-3 font-semibold text-[#071A3D] disabled:opacity-60">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm font-semibold">
            <Link href={registerHref} className="text-[#071A3D]">Create candidate account</Link>
            <Link href="/employer/register" className="text-[#071A3D]">Create employer account</Link>
            <Link href="/forgot-password" className="text-[#B8860B]">Forgot password?</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
