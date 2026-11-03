import { CONTACT_ERROR_CODES, createContactSchema } from './contact';

// The cases of specs/2026-11-03-validation/validation.md use this date as today.
const TODAY = '2026-11-03';

// validation.md, "Whole request": every case changes one field of this request.
const VALID_REQUEST: Readonly<Record<string, unknown>> = {
  name: 'Ana López',
  instagram: '@ana.lopez_',
  email: 'ana@example.com',
  location: 'Madrid / España',
  placement: 'Left forearm',
  symmetry: 'not-sure',
  dates: { from: '2026-11-10', to: '2026-11-20' },
  flexibleDates: 'yes',
  tattooHistory: 'first',
  notes: 'Fine line.',
  consent: true,
};

const MISSING = Symbol('missing key');

/** The request with one field set to `value`, or removed for `MISSING`. */
function requestWith(field: string, value: unknown): Record<string, unknown> {
  const request = { ...VALID_REQUEST };
  if (value === MISSING) {
    delete request[field];
  } else {
    request[field] = value;
  }
  return request;
}

/** Parses the request and returns the error codes reported on `path`. */
function errorsAt(request: Record<string, unknown>, path: string): string[] {
  const result = createContactSchema(TODAY).safeParse(request);
  if (result.success) {
    return [];
  }
  return result.error.issues
    .filter((issue) => issue.path.join('.') === path)
    .map((issue) => issue.message);
}

/** Parses the request, expecting it to be valid, and returns the validated value. */
function validated(request: Record<string, unknown>): Record<string, unknown> {
  const result = createContactSchema(TODAY).safeParse(request);
  expect(result.success ? [] : result.error.issues).toEqual([]);
  return result.data as Record<string, unknown>;
}

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

// validation.md, "Text fields". `placement` joins them in group 3.
describe.each(['name', 'location'])('%s', (field) => {
  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['a'.repeat(101), 'too-long'],
    [`  ${'a'.repeat(101)}  `, 'too-long'],
    ['Ana\nBcc: x@example.com', 'characters'],
    ['Ana\tLópez', 'characters'],
    [MISSING, 'required'],
  ])('rejects %j with %s', (value, code) => {
    expect(errorsAt(requestWith(field, value), field)).toEqual([code]);
  });

  it.each([
    ['  Ana  ', 'Ana'],
    ['José Ñúñez', 'José Ñúñez'],
    ['李小龍', '李小龍'],
    ['a'.repeat(100), 'a'.repeat(100)],
    // Edge cases beyond validation.md.
    [`  ${'a'.repeat(100)}  `, 'a'.repeat(100)], // the limit counts the trimmed text
    ['Ana López', 'Ana López'], // a no-break space is not a control character
  ])('accepts %j as %j', (value, expected) => {
    expect(validated(requestWith(field, value))[field]).toBe(expected);
  });

  it.each([['Ana\r\nx'], ['Ana\u0000'], ['Ana\u007f'], ['Ana\u0085']])(
    'rejects the control character in %j',
    (value) => {
      expect(errorsAt(requestWith(field, value), field)).toEqual(['characters']);
    },
  );

  it('reports required, not characters, for only whitespace and line breaks', () => {
    expect(errorsAt(requestWith(field, ' \n\t '), field)).toEqual(['required']);
  });

  it('reports too-long, not characters, when both apply', () => {
    expect(errorsAt(requestWith(field, `${'a'.repeat(101)}\n`), field)).toEqual(['too-long']);
  });

  it('rejects a value that is not text', () => {
    expect(errorsAt(requestWith(field, 42), field)).toEqual(['required']);
  });
});

// validation.md, "instagram".
describe('instagram', () => {
  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['@', 'instagram'],
    ['a'.repeat(31), 'instagram'],
    ['ana lopez', 'instagram'],
    ['ana!', 'instagram'],
    ['@@ana', 'instagram'],
    ['https://instagram.com/ana', 'instagram'],
    // Edge cases beyond validation.md.
    [MISSING, 'required'],
    ['@'.padEnd(32, 'a'), 'instagram'], // 31 characters after the @
  ])('rejects %j with %s', (value, code) => {
    expect(errorsAt(requestWith('instagram', value), 'instagram')).toEqual([code]);
  });

  it.each([
    ['ana.lopez_', 'ana.lopez_'],
    ['@ana.lopez_', 'ana.lopez_'],
    [' @ana ', 'ana'],
    ['a'.repeat(30), 'a'.repeat(30)],
    // Edge cases beyond validation.md.
    [`@${'a'.repeat(30)}`, 'a'.repeat(30)], // the @ does not count towards the 30
    ['Ana_2026', 'Ana_2026'], // case is kept
    ['ana\n', 'ana'], // a trailing line break is whitespace, trimmed away
  ])('accepts %j as %j', (value, expected) => {
    expect(validated(requestWith('instagram', value))['instagram']).toBe(expected);
  });

  it.each([['añá'], ['ana\u0000'], ['ana-lopez']])('rejects %j', (value) => {
    expect(errorsAt(requestWith('instagram', value), 'instagram')).toEqual(['instagram']);
  });
});

// validation.md, "email".
describe('email', () => {
  it.each([
    ['', 'required'],
    ['ana@', 'email'],
    ['ana example.com', 'email'],
    ['ana@example', 'email'],
    [`${'a'.repeat(243)}@example.com`, 'too-long'], // 255 characters
    // Edge cases beyond validation.md.
    ['   ', 'required'],
    [MISSING, 'required'],
    ['ana@example.com\nBcc: x@example.com', 'email'],
  ])('rejects %j with %s', (value, code) => {
    expect(errorsAt(requestWith('email', value), 'email')).toEqual([code]);
  });

  it.each([
    ['ana@example.com', 'ana@example.com'],
    [' ana@example.com ', 'ana@example.com'],
    // Edge cases beyond validation.md.
    [`${'a'.repeat(64)}@${'b'.repeat(185)}.com`, `${'a'.repeat(64)}@${'b'.repeat(185)}.com`], // 254 characters
    ['Ana.Lopez+tattoo@example.co.uk', 'Ana.Lopez+tattoo@example.co.uk'],
  ])('accepts %j as %j', (value, expected) => {
    expect(validated(requestWith('email', value))['email']).toBe(expected);
  });
});
