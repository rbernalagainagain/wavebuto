import { NAME_ERROR, validateName } from './name';

describe('validateName', () => {
  it('passes for a plain name', () => {
    expect(validateName('Ada')).toBeNull();
  });

  it('passes at exactly the minimum length', () => {
    expect(validateName('Jo')).toBeNull();
  });

  it('fails below the minimum length', () => {
    expect(validateName('A')).toBe(NAME_ERROR);
  });

  it('fails when empty', () => {
    expect(validateName('')).toBe(NAME_ERROR);
  });

  it('fails when whitespace-only', () => {
    expect(validateName('   ')).toBe(NAME_ERROR);
  });

  it('passes after trimming surrounding whitespace', () => {
    expect(validateName('  Ada  ')).toBeNull();
  });

  it('fails over the maximum length', () => {
    expect(validateName('a'.repeat(81))).toBe(NAME_ERROR);
  });

  it('passes at exactly the maximum length', () => {
    expect(validateName('a'.repeat(80))).toBeNull();
  });

  it('passes for names containing unexpected characters, since only length is constrained', () => {
    expect(validateName('Ada 👩‍💻 Ö\'Brien-Smith')).toBeNull();
  });
});
