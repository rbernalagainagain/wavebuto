import { EMAIL_ERROR, validateEmail } from './email';

describe('validateEmail', () => {
  it('passes for a plain address', () => {
    expect(validateEmail('ada@example.com')).toBeNull();
  });

  it('passes for a multi-segment domain', () => {
    expect(validateEmail('ada@sub.example.co.uk')).toBeNull();
  });

  it('fails without an @', () => {
    expect(validateEmail('ada')).toBe(EMAIL_ERROR);
  });

  it('fails without a domain', () => {
    expect(validateEmail('ada@')).toBe(EMAIL_ERROR);
  });

  it('fails with nothing before the @', () => {
    expect(validateEmail('@example.com')).toBe(EMAIL_ERROR);
  });

  it('fails with two @ characters', () => {
    expect(validateEmail('ada@@example.com')).toBe(EMAIL_ERROR);
  });

  it('fails with no dot in the domain', () => {
    expect(validateEmail('ada@example')).toBe(EMAIL_ERROR);
  });

  it('fails when the final domain segment is too short', () => {
    expect(validateEmail('ada@example.c')).toBe(EMAIL_ERROR);
  });

  it('fails when empty', () => {
    expect(validateEmail('')).toBe(EMAIL_ERROR);
  });

  it('fails when whitespace-only', () => {
    expect(validateEmail('    ')).toBe(EMAIL_ERROR);
  });

  it('passes after trimming surrounding whitespace', () => {
    expect(validateEmail('  ada@example.com  ')).toBeNull();
  });

  it('passes at exactly the maximum length', () => {
    const domain = '@example.com';
    const local = 'a'.repeat(254 - domain.length);
    const address = `${local}${domain}`;
    expect(address.length).toBe(254);
    expect(validateEmail(address)).toBeNull();
  });

  it('fails over the maximum length', () => {
    const domain = '@example.com';
    const local = 'a'.repeat(255 - domain.length);
    const address = `${local}${domain}`;
    expect(address.length).toBe(255);
    expect(validateEmail(address)).toBe(EMAIL_ERROR);
  });

  it('fails when a domain segment is empty (consecutive dots)', () => {
    expect(validateEmail('ada@example..com')).toBe(EMAIL_ERROR);
  });
});
