import { z } from 'zod';

// The single definition of the contact form's rules (spec.md §3). The same schema validates what the
// user types (ContactForm) and produces the trimmed payload handed to src/app/submit/ (spec.md §5).
// Error messages are translation keys: the copy of spec.md §4 lives in the translation files.

export const NAME_ERROR = 'contact.errors.name';
export const EMAIL_ERROR = 'contact.errors.email';
export const SUBJECT_ERROR = 'contact.errors.subject';
export const MESSAGE_ERROR = 'contact.errors.message';

export const SUBJECT_OPTIONS = ['general', 'support', 'other'] as const;

// Exactly one @, at least one character before it, and a dot-separated domain with no empty
// segment whose final segment is 2+ characters. Deliberately permissive (spec.md §3.2).
const EMAIL_PATTERN = /^[^@]+@[^@.]+(\.[^@.]+)*\.[^@.]{2,}$/;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, NAME_ERROR).max(80, NAME_ERROR),
  email: z.string().trim().max(254, EMAIL_ERROR).regex(EMAIL_PATTERN, EMAIL_ERROR),
  subject: z.string().trim().pipe(z.enum(SUBJECT_OPTIONS, SUBJECT_ERROR)),
  message: z.string().trim().min(10, MESSAGE_ERROR).max(2000, MESSAGE_ERROR),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.output<typeof contactFormSchema>;
export type SubjectValue = (typeof SUBJECT_OPTIONS)[number];
export type FieldName = keyof ContactFormInput;

/** Validates one field against its rule in the schema: null when valid, else the error key. */
export function validateField(field: FieldName, rawValue: string): string | null {
  const result = contactFormSchema.shape[field].safeParse(rawValue);
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}

// Per-field entry points, each pinned by its own spec to the worked examples of spec.md §3.
export const validateName = (rawValue: string) => validateField('name', rawValue);
export const validateEmail = (rawValue: string) => validateField('email', rawValue);
export const validateSubject = (rawValue: string) => validateField('subject', rawValue);
export const validateMessage = (rawValue: string) => validateField('message', rawValue);
