export const NAME_ERROR = 'Enter your name (2–80 characters).';

const MIN_LENGTH = 2;
const MAX_LENGTH = 80;

export function validateName(rawValue: string): string | null {
  const value = rawValue.trim();
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    return NAME_ERROR;
  }
  return null;
}
