export function safeNextPath(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }

  if (next.startsWith("/auth/") || next.startsWith("/login")) {
    return fallback;
  }

  return next;
}

