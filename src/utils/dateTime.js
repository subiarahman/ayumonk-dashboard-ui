const IST_TIME_ZONE = "Asia/Kolkata";
const ISO_WITHOUT_TIMEZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const normalized = ISO_WITHOUT_TIMEZONE.test(value) ? `${value}Z` : value;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatInIST(value, options) {
  const date = parseDateValue(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDateTimeIST(value) {
  return formatInIST(value, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function formatDateIST(value) {
  return formatInIST(value, {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function formatDateTimeISTShort(value) {
  return formatInIST(value, {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseDateForSorting(value) {
  const date = parseDateValue(value);
  return date ? date.getTime() : 0;
}
