"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ChatResponse = {
  conversationId?: string;
  reply?: string;
  workerLabel?: string;
  error?: string;
};

type ContactState = {
  fullName: string;
  phone: string;
  email: string;
  jobInterest: string;
  countryInterest: string;
  consentToContact: boolean;
};

const initialContact: ContactState = {
  fullName: "",
  phone: "",
  email: "",
  jobInterest: "",
  countryInterest: "",
  consentToContact: false,
};

export function FaithChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [contact, setContact] = useState<ContactState>(initialContact);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "faith-welcome",
      role: "assistant",
      text: "Hello, I’m Faith Moraa, Red Stone’s Recruitment Assistant. I can help with jobs, applications, documents, destinations and recruitment questions. How can I help you today?",
    },
  ]);

  const detailsCount = useMemo(
    () => [contact.fullName, contact.phone, contact.email, contact.jobInterest, contact.countryInterest].filter((value) => value.trim()).length,
    [contact],
  );

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const outgoing = message.trim();
    if (!outgoing || sending) return;

    setError("");
    setSending(true);
    setMessage("");
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: outgoing },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: outgoing,
          conversationId,
          contact: {
            fullName: contact.fullName || undefined,
            phone: contact.phone || undefined,
            email: contact.email || undefined,
            jobInterest: contact.jobInterest || undefined,
            countryInterest: contact.countryInterest || undefined,
            consentToContact: contact.consentToContact,
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ChatResponse;
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Faith is temporarily unavailable.");
      }

      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((current) => [
        ...current,
        { id: `faith-${Date.now()}`, role: "assistant", text: data.reply ?? "" },
      ]);
    } catch (requestError) {
      console.error("Faith chat request failed", requestError);
      setError("Faith is temporarily unavailable. Please use Red Stone’s official contact channels if you need immediate assistance.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          className="flex h-[min(680px,78vh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          aria-label="Chat with Faith Moraa"
        >
          <header className="bg-[#071A3D] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">Red Stone AI Assistant</p>
                <h2 className="mt-1 text-xl font-black">Faith Moraa</h2>
                <p className="mt-1 text-xs leading-5 text-slate-300">Recruitment guidance, candidate support and human handover.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/10"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left text-xs font-bold text-[#071A3D]"
            >
              <span>Your candidate details ({detailsCount}/5)</span>
              <span>{showDetails ? "Hide" : "Add details"}</span>
            </button>

            {showDetails ? (
              <div className="mt-3 grid gap-2">
                <input
                  value={contact.fullName}
                  onChange={(event) => setContact((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Full name"
                  autoComplete="name"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B8860B]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={contact.phone}
                    onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone"
                    autoComplete="tel"
                    className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B8860B]"
                  />
                  <input
                    value={contact.email}
                    onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B8860B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={contact.jobInterest}
                    onChange={(event) => setContact((current) => ({ ...current, jobInterest: event.target.value }))}
                    placeholder="Job interest"
                    className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B8860B]"
                  />
                  <input
                    value={contact.countryInterest}
                    onChange={(event) => setContact((current) => ({ ...current, countryInterest: event.target.value }))}
                    placeholder="Country"
                    className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B8860B]"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <input
                    type="checkbox"
                    checked={contact.consentToContact}
                    onChange={(event) => setContact((current) => ({ ...current, consentToContact: event.target.checked }))}
                    className="mt-1"
                  />
                  <span>I agree that Red Stone may contact me about my recruitment enquiry.</span>
                </label>
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-white p-4" aria-live="polite">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  item.role === "assistant"
                    ? "mr-auto bg-slate-100 text-slate-700"
                    : "ml-auto bg-[#071A3D] text-white"
                }`}
              >
                {item.text}
              </div>
            ))}
            {sending ? (
              <div className="mr-auto rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Faith is responding…</div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            {error ? <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</p> : null}
            <form onSubmit={sendMessage} className="flex gap-2">
              <label className="sr-only" htmlFor="faith-message">Message Faith Moraa</label>
              <textarea
                id="faith-message"
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 1500))}
                placeholder="Ask Faith about jobs or your application…"
                rows={2}
                disabled={sending}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#B8860B] disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="self-end rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-black text-[#071A3D] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Send
              </button>
            </form>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">Faith can make mistakes. Jobs, visas and immigration outcomes are never guaranteed. Do not send passwords, OTPs or bank PINs.</p>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full bg-[#071A3D] px-5 py-3.5 text-sm font-black text-white shadow-xl ring-1 ring-white/20 transition hover:-translate-y-0.5"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-[#071A3D]">F</span>
        <span>{open ? "Close Faith" : "Chat with Faith"}</span>
      </button>
    </div>
  );
}
