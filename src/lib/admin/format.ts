import type { Row } from "./types";

export function textValue(row: Row | null | undefined, keys: string[], fallback = "Not set") {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }

    if (typeof value === "number") {
      return value.toString();
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
  }

  return fallback;
}

export function numberValue(row: Row | null | undefined, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

export function booleanText(row: Row | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
  }

  return "Not set";
}

export function dateText(value: unknown, fallback = "Not set") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function moneyText(row: Row | null | undefined) {
  const currency = textValue(row, ["currency"], "");
  const min = row?.salary_min;
  const max = row?.salary_max;
  const period = textValue(row, ["salary_period"], "");
  const parts: string[] = [];

  if (typeof min === "number") {
    parts.push(min.toLocaleString("en-KE"));
  }

  if (typeof max === "number") {
    parts.push(max.toLocaleString("en-KE"));
  }

  if (parts.length === 0) {
    return "Not listed";
  }

  return `${currency} ${parts.join(" - ")}${period ? ` / ${period}` : ""}`.trim();
}

export function nestedRow(row: Row | null | undefined, key: string) {
  const value = row?.[key];

  if (Array.isArray(value)) {
    return (value[0] ?? null) as Row | null;
  }

  if (typeof value === "object" && value !== null) {
    return value as Row;
  }

  return null;
}
