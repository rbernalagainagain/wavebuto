/**
 * The calendar date of `date` in the browser's time zone, as `YYYY-MM-DD`:
 * the visitor's own today, which the schema uses as `today`
 * (specs/2026-11-03-form/requirements.md, decision 4). Not `toISOString()`,
 * which gives the date in UTC and so is a day off for part of the day
 * anywhere but UTC.
 */
export function localDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
