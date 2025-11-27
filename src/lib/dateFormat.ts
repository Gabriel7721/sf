// src/lib/dateFormat.ts
/**
 * Chuyển '2025-11-27' -> '27/11/2025'
 * Nếu không đúng format thì trả về nguyên chuỗi cũ.
 */
export function formatISOToDMY(iso: string | undefined | null): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso; // fallback

  const [year, month, day] = parts;
  if (!year || !month || !day) return iso;

  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}
