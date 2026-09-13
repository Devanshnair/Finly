/**
 * Number and financial formatters for Finly
 */

export function formatINR(
  value: number | null | undefined,
  options?: { showSign?: boolean; maximumFractionDigits?: number; fallback?: string }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? "—";
  }

  const maxDigits = options?.maximumFractionDigits ?? 2;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  }).format(Math.abs(value));

  if (value < 0) {
    return `-${formatted}`;
  }
  if (options?.showSign && value > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

export function formatPercent(
  value: number | null | undefined,
  options?: { showSign?: boolean; fallback?: string }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? "—";
  }

  const formatted = `${Math.abs(value).toFixed(2)}%`;

  if (value < 0) {
    return `-${formatted}`;
  }
  if (options?.showSign !== false && value > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(2)}x`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(value);
}
