import { PublicShell } from "@/components/public/public-shell";
import HomePage from "./(public)/home-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <PublicShell>
      <HomePage />
    </PublicShell>
  );
}
