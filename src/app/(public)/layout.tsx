import { FaithChat } from "@/components/public/faith-chat";
import { PublicShell } from "@/components/public/public-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const faithEnabled =
    process.env.AI_WEBSITE_CHAT_ENABLED === "true" &&
    Boolean(process.env.OPENAI_API_KEY?.trim()) &&
    Boolean(process.env.AI_RATE_LIMIT_SALT?.trim());

  return (
    <>
      <PublicShell>{children}</PublicShell>
      {faithEnabled ? <FaithChat /> : null}
    </>
  );
}
