export const MESSAGE_ERROR = 'Enter a message (at least 10 characters).';

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

export function validateMessage(rawValue: string): string | null {
  const value = rawValue.trim();
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    return MESSAGE_ERROR;
  }
  return null;
}
