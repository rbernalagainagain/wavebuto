import { z } from 'zod';

/**
 * The error codes of the appointment form (specs/2026-11-03-validation/
 * requirements.md, decision 3). Each issue's message is one of these codes;
 * the English and Spanish text for each lives in specs/form.md, "Errors", and
 * the form shows it. This folder holds no user-visible text.
 */
export const CONTACT_ERROR_CODES = [
  'required',
  'too-long',
  'characters',
  'email',
  'instagram',
  'option',
  'date',
  'date-past',
  'date-order',
  'consent',
] as const;

export type ContactErrorCode = (typeof CONTACT_ERROR_CODES)[number];

// The shape of `today`: the caller's current date, `YYYY-MM-DD`.
const TODAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The schema of an appointment request (specs/form.md). `today` is the
 * caller's current date as `YYYY-MM-DD`, so the schema never reads a clock.
 * A `today` in another format is a bug in the caller, not a user error, so it
 * throws instead of producing a schema that would misjudge every date.
 */
export function createContactSchema(today: string) {
  if (!TODAY_FORMAT.test(today)) {
    throw new TypeError(`today must be a YYYY-MM-DD date, got ${JSON.stringify(today)}`);
  }
  return z.object({});
}

export type ContactRequest = z.output<ReturnType<typeof createContactSchema>>;
