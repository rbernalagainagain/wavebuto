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

// Any control character (Unicode category Cc), line breaks and tabs included.
const CONTROL_CHARACTER = /\p{Cc}/u;
// An optional @, then an Instagram username: 1–30 letters, digits, . or _.
const INSTAGRAM_FORMAT = /^@?[A-Za-z0-9._]{1,30}$/;

// The longest single-line text and email address (requirements.md, decision 5).
const SINGLE_LINE_MAX = 100;
const EMAIL_MAX = 254;

// A field reports one code: the first rule it breaks, in the order
// required → too-long → format. Zod already skips a refine or a pipe once the
// field has an error, but not its built-in checks (min, max, regex), so every
// rule stops the field's checks when it fails.
const STOP = { abort: true } as const;

/** Required text, trimmed: not empty, then not longer than `max`. */
function requiredText(max: number) {
  return z
    .string({ error: 'required' })
    .trim()
    .min(1, { error: 'required', ...STOP })
    .max(max, { error: 'too-long', ...STOP });
}

/** A required single-line text field: `name`, `location`, `placement`. */
function singleLineText() {
  return requiredText(SINGLE_LINE_MAX).refine((value) => !CONTROL_CHARACTER.test(value), {
    error: 'characters',
    ...STOP,
  });
}

/** The Instagram username, validated and returned without its `@`. */
function instagram() {
  return z
    .string({ error: 'required' })
    .trim()
    .min(1, { error: 'required', ...STOP })
    .regex(INSTAGRAM_FORMAT, { error: 'instagram', ...STOP })
    .transform((value) => value.replace(/^@/, ''));
}

/**
 * An optional radio group with the given values (specs/form.md). Nothing
 * chosen, sent as a missing key or `''`, is absent. A radio value is never
 * typed, so it is matched exactly: no trimming, no change of case.
 */
function optionalRadio<const Values extends readonly [string, ...string[]]>(values: Values) {
  return z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(values, { error: 'option' }).optional(),
  );
}

/** A required email address, at most `EMAIL_MAX` characters. */
function email() {
  return requiredText(EMAIL_MAX).pipe(z.email({ error: 'email' }));
}

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
  return z.object({
    // 01 — Personal information
    name: singleLineText(),
    instagram: instagram(),
    email: email(),
    location: singleLineText(),
    // 02 — Tattoo
    placement: singleLineText(),
    symmetry: optionalRadio(['symmetrical', 'asymmetrical', 'not-sure']),
  });
}

export type ContactRequest = z.output<ReturnType<typeof createContactSchema>>;
