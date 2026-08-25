export function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("02")) {
    if (digits.length === 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    if (digits.length === 10) return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    return digits;
  }

  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;

  return digits;
}

export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}
