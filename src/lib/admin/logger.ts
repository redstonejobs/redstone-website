type LogDetails = Record<string, unknown>;

export function adminInfo(message: string, details: LogDetails = {}) {
  console.info("[admin]", message, redact(details));
}

export function adminWarn(message: string, details: LogDetails = {}) {
  console.warn("[admin]", message, redact(details));
}

export function adminError(message: string, details: LogDetails = {}) {
  console.error("[admin]", message, redact(details));
}

function redact(details: LogDetails) {
  const blocked = new Set(["token", "password", "cookie", "secret", "authorization"]);

  return Object.fromEntries(
    Object.entries(details).filter(([key]) => !blocked.has(key.toLowerCase()))
  );
}

