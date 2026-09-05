export function normalizeEmailContact(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function normalizePhoneContact(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (/^254\d{9}$/.test(digits)) {
    return digits;
  }

  if (/^0\d{9}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^7\d{8}$/.test(digits)) {
    return `254${digits}`;
  }

  return digits;
}
