"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: passwordError } =
      await supabase.auth.updateUser({
        password,
      });

    if (passwordError) {
      setMessage(
        "We could not update your password. Please try again or request a fresh reset link."
      );
      setLoading(false);
      return;
    }

    const { error: completionError } =
      await supabase.rpc(
        "complete_staff_first_login_password_change"
      );

    if (completionError) {
      setMessage(
        "Your password was changed, but account activation could not be completed. Please contact support."
      );
      setLoading(false);
      return;
    }

    setMessage(
      "Password changed successfully. Opening your account..."
    );

    router.replace("/auth/redirect");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-md bg-white p-8 shadow-xl"
      >
        <RedstoneLogo
          href="/"
          size="lg"
          showText
          subtitle="Secure Staff Account"
          priority
          className="mb-6 text-[#071A3D]"
          textClassName="text-[#071A3D]"
        />

        <h1 className="text-3xl font-black text-[#071A3D]">
          Choose a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          For security, replace your temporary password with a private password
          known only to you.
        </p>

        <label className="mt-6 grid gap-2 text-sm font-bold text-slate-800">
          New Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-800">
          Confirm Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
          />
        </label>

        {message ? (
          <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-[#071A3D]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md bg-[#D4AF37] px-5 py-3 font-black text-[#071A3D] disabled:opacity-60"
        >
          {loading ? "Updating password..." : "Update Password"}
        </button>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Red Stone administrators will never ask you to send your password by
          email, WhatsApp or SMS.
        </p>
      </form>
    </main>
  );
}
