export const EMAIL_ERROR = 'Enter a valid email address, like ada@example.com.';

const MAX_LENGTH = 254;
const MIN_FINAL_SEGMENT_LENGTH = 2;

export function validateEmail(rawValue: string): string | null {
  const value = rawValue.trim();
  if (value === '' || value.length > MAX_LENGTH) {
    return EMAIL_ERROR;
  }

  const atParts = value.split('@');
  if (atParts.length !== 2) {
    return EMAIL_ERROR;
  }

  const [local, domain] = atParts;
  if (local.length === 0) {
    return EMAIL_ERROR;
  }

  const domainSegments = domain.split('.');
  if (domainSegments.length < 2 || domainSegments.some((segment) => segment.length === 0)) {
    return EMAIL_ERROR;
  }

  const finalSegment = domainSegments[domainSegments.length - 1];
  if (finalSegment.length < MIN_FINAL_SEGMENT_LENGTH) {
    return EMAIL_ERROR;
  }

  return null;
}
