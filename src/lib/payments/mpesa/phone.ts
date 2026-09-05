export function normalizeMpesaPhone(input: string) {
  const digits = input.replace(/[\s().-]+/g, "").replace(/^\+/, "");

  if (/^(07|01)\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^254(7|1)\d{8}$/.test(digits)) {
    return digits;
  }

  throw new Error("Enter a valid Kenyan M-Pesa phone number.");
}

