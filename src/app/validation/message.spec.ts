import { MESSAGE_ERROR, validateMessage } from './message';

describe('validateMessage', () => {
  it('passes for a plain message', () => {
    expect(validateMessage('Hello there')).toBeNull();
  });

  it('fails below the minimum length', () => {
    expect(validateMessage('Hi')).toBe(MESSAGE_ERROR);
  });

  it('passes at exactly the minimum length', () => {
    expect(validateMessage('a'.repeat(10))).toBeNull();
  });

  it('fails when whitespace-only', () => {
    expect(validateMessage(' '.repeat(10))).toBe(MESSAGE_ERROR);
  });

  it('fails over the maximum length', () => {
    expect(validateMessage('a'.repeat(2001))).toBe(MESSAGE_ERROR);
  });

  it('passes at exactly the maximum length', () => {
    expect(validateMessage('a'.repeat(2000))).toBeNull();
  });

  it('fails when empty', () => {
    expect(validateMessage('')).toBe(MESSAGE_ERROR);
  });

  it('passes after trimming surrounding whitespace down to the minimum', () => {
    expect(validateMessage(`  ${'a'.repeat(10)}  `)).toBeNull();
  });

  it('passes for messages containing unexpected characters, since only length is constrained', () => {
    expect(validateMessage('Hello 👋 — thanks for reaching out! 日本語もOK。')).toBeNull();
  });
});
