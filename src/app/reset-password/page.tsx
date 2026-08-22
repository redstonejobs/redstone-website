"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8 || password !== confirm) {
      setMessage("Password must be at least 8 characters and match confirmation.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? "We could not update your password. Please use a fresh reset link." : "Password updated. You can now sign in.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F3F4F6] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-[#071A3D]">Choose a new password</h1>
        <label className="mt-5 grid gap-2 text-sm font-bold">
          New Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-bold">
          Confirm Password
          <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
        </label>
        {message ? <p className="mt-4 text-sm font-semibold text-[#071A3D]">{message}</p> : null}
        <button className="mt-5 w-full rounded-md bg-[#D4AF37] px-5 py-3 font-black text-[#071A3D]">Update Password</button>
      </form>
    </main>
  );
}

