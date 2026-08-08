import { SUBJECT_ERROR, SUBJECT_OPTIONS, validateSubject } from './subject';

describe('validateSubject', () => {
  it('passes for an allowed value', () => {
    expect(validateSubject('support')).toBeNull();
  });

  it('fails when empty (prompt option still selected)', () => {
    expect(validateSubject('')).toBe(SUBJECT_ERROR);
  });

  it('fails for a value outside the allowed set', () => {
    expect(validateSubject('urgent')).toBe(SUBJECT_ERROR);
  });

  it('fails when whitespace-only', () => {
    expect(validateSubject('   ')).toBe(SUBJECT_ERROR);
  });

  it('exposes exactly the three allowed values, in order', () => {
    expect(SUBJECT_OPTIONS).toEqual(['general', 'support', 'other']);
  });
});
