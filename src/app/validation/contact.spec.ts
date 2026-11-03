import { CONTACT_ERROR_CODES, createContactSchema } from './contact';

// The cases of specs/2026-11-03-validation/validation.md use this date as today.
const TODAY = '2026-11-03';

describe('CONTACT_ERROR_CODES', () => {
  // requirements.md, decision 3. specs/form.md has a text for each of them.
  it('is the fixed list of codes', () => {
    expect(CONTACT_ERROR_CODES).toEqual([
      'required',
      'too-long',
      'characters',
      'email',
      'instagram',
      'option',
      'date',
      'date-past',
      'date-order',
      'consent',
    ]);
  });
});

describe('createContactSchema', () => {
  it('builds a schema for a YYYY-MM-DD today', () => {
    expect(() => createContactSchema(TODAY)).not.toThrow();
  });

  it.each(['', '03/11/2026', '2026-11-3', '2026-11-03T00:00:00Z'])(
    'throws for a today in another format: %j',
    (today) => {
      expect(() => createContactSchema(today)).toThrow(TypeError);
    },
  );
});
