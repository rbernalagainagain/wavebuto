export const SUBJECT_OPTIONS = ['general', 'support', 'other'] as const;

export type SubjectValue = (typeof SUBJECT_OPTIONS)[number];

export const SUBJECT_ERROR = 'Choose what this is about.';

export function validateSubject(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!(SUBJECT_OPTIONS as readonly string[]).includes(value)) {
    return SUBJECT_ERROR;
  }
  return null;
}
