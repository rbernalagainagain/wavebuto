import { CONTACT_ERROR_CODES, type ContactErrorCode } from '../validation/contact';

/**
 * The text of each error code, from specs/form.md, "Errors". Typed by
 * `ContactErrorCode`, so a code without a text does not compile
 * (specs/2026-11-03-form/requirements.md, decision 9).
 */
export const CONTACT_ERROR_TEXT: Readonly<Record<ContactErrorCode, string>> = {
  required: $localize`:@@contact.error.required:This field is required.`,
  'too-long': $localize`:@@contact.error.too-long:This text is too long.`,
  characters: $localize`:@@contact.error.characters:This text contains characters that are not allowed.`,
  email: $localize`:@@contact.error.email:Enter a valid email address, like name@example.com.`,
  instagram: $localize`:@@contact.error.instagram:Enter your Instagram username: letters, numbers, dots and underscores, up to 30.`,
  option: $localize`:@@contact.error.option:Choose one of the options.`,
  date: $localize`:@@contact.error.date:Choose a valid date.`,
  'date-past': $localize`:@@contact.error.date-past:Choose today or a later date.`,
  'date-order': $localize`:@@contact.error.date-order:"To" can't be before "From".`,
  consent: $localize`:@@contact.error.consent:Tick the box to send your request.`,
};

function isContactErrorCode(code: string): code is ContactErrorCode {
  return (CONTACT_ERROR_CODES as readonly string[]).includes(code);
}

/**
 * The text shown for an error code. A code with no text would be a bug; it is
 * shown as it is, so the field still fails visibly instead of looking valid.
 */
export function errorTextFor(code: string): string {
  return isContactErrorCode(code) ? CONTACT_ERROR_TEXT[code] : code;
}
