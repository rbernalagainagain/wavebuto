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

/** Parses the request and returns every error as `path: code`. */
function allErrors(request: Record<string, unknown>): string[] {
  const result = createContactSchema(TODAY).safeParse(request);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
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

  it.each(['', '03/11/2026', '2026-11-3', '2026-11-03T00:00:00Z', '2026-02-30'])(
    'throws for a today in another format: %j',
    (today) => {
      expect(() => createContactSchema(today)).toThrow(TypeError);
    },
  );
});

// validation.md, "Text fields".
describe.each(['name', 'location', 'placement'])('%s', (field) => {
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
    ['Ana\u00a0López', 'Ana\u00a0López'], // a no-break space is not a control character
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

// validation.md, "Radio groups": each group's values, from specs/form.md.
const RADIO_GROUPS: Record<string, { values: string[]; otherGroupValue: string }> = {
  symmetry: { values: ['symmetrical', 'asymmetrical', 'not-sure'], otherGroupValue: 'yes' },
  flexibleDates: { values: ['yes', 'no'], otherGroupValue: 'symmetrical' },
  tattooHistory: { values: ['first', 'same-area', 'other-areas'], otherGroupValue: 'not-sure' },
};

describe.each(Object.entries(RADIO_GROUPS))('%s', (field, { values, otherGroupValue }) => {
  it.each([[MISSING], ['']])('treats %j as absent', (value) => {
    expect(validated(requestWith(field, value))[field]).toBeUndefined();
  });

  it.each(values)('accepts %j', (value) => {
    expect(validated(requestWith(field, value))[field]).toBe(value);
  });

  it.each([
    [values[0].charAt(0).toUpperCase() + values[0].slice(1)], // another case
    [otherGroupValue], // a value of another group
    // Edge cases beyond validation.md.
    [` ${values[0]} `], // a radio value is never typed, so it is not trimmed
    ['   '],
    [42],
    [null],
  ])('rejects %j with option', (value) => {
    expect(errorsAt(requestWith(field, value), field)).toEqual(['option']);
  });
});

// validation.md, "dates", with today = 2026-11-03.
describe('dates', () => {
  const withDates = (dates: unknown) => requestWith('dates', dates);

  it.each([
    ['', '', 'dates.from: required'],
    ['2026-11-02', '', 'dates.from: date-past'],
    ['2026-11-10', '2026-11-09', 'dates.to: date-order'],
    ['2026-02-30', '', 'dates.from: date'],
    ['03/11/2026', '', 'dates.from: date'],
    ['2026-11-10', 'tomorrow', 'dates.to: date'],
    ['2027-02-29', '', 'dates.from: date'],
    // Edge cases beyond validation.md.
    ['   ', '', 'dates.from: required'],
    ['2026-11-03T10:00', '', 'dates.from: date'],
    ['2026-13-01', '', 'dates.from: date'],
    ['2026-11-10', '2026-02-30', 'dates.to: date'],
    ['2026-11-10', '2026-11-03', 'dates.to: date-order'], // today, but before from
    // to is only compared with a valid from: one error, on from.
    ['2026-11-02', '2026-11-01', 'dates.from: date-past'],
    ['nope', '2026-11-01', 'dates.from: date'],
  ])('rejects from %j, to %j with %s', (from, to, error) => {
    expect(allErrors(withDates({ from, to }))).toEqual([error]);
  });

  it.each([
    ['2026-11-03', '', { from: '2026-11-03' }], // a single day, today
    ['2026-11-10', '2026-11-10', { from: '2026-11-10', to: '2026-11-10' }],
    ['2026-11-10', '2026-11-20', { from: '2026-11-10', to: '2026-11-20' }],
    ['2027-11-03', '', { from: '2027-11-03' }], // no upper limit
    ['2028-02-29', '', { from: '2028-02-29' }], // leap year
    // Edge cases beyond validation.md.
    [' 2026-11-10 ', '   ', { from: '2026-11-10' }], // trimmed; a blank to is absent
    ['2026-12-31', '2027-01-01', { from: '2026-12-31', to: '2027-01-01' }], // across years
  ] as [string, string, { from: string; to?: string }][])(
    'accepts from %j, to %j',
    (from, to, expected) => {
      const dates = validated(withDates({ from, to }))['dates'];
      expect(dates).toEqual(expected);
      expect((dates as Record<string, unknown>)['to']).toBe(expected.to);
    },
  );

  it('accepts a missing to as a single day', () => {
    expect(validated(withDates({ from: '2026-11-10' }))['dates']).toEqual({ from: '2026-11-10' });
  });

  it('reports required on from when dates is missing', () => {
    expect(allErrors(requestWith('dates', MISSING))).toEqual(['dates.from: required']);
  });

  it('reports required on dates when it is not an object', () => {
    expect(allErrors(withDates('2026-11-10'))).toEqual(['dates: required']);
  });

  it('uses the today it was given', () => {
    const request = withDates({ from: '2026-11-04', to: '' });
    expect(createContactSchema('2026-11-04').safeParse(request).success).toBe(true);
    expect(createContactSchema('2026-11-05').safeParse(request).success).toBe(false);
  });
});

// validation.md, "notes".
describe('notes', () => {
  it.each([[MISSING], [''], ['  '], [' \n\t ']])('treats %j as absent', (value) => {
    expect(validated(requestWith('notes', value))['notes']).toBeUndefined();
  });

  it.each([
    ['Fine line.\nNo colour.', 'Fine line.\nNo colour.'],
    ['Col 1\tCol 2', 'Col 1\tCol 2'],
    ['a'.repeat(2000), 'a'.repeat(2000)],
    // Edge cases beyond validation.md.
    ['Line 1\r\nLine 2', 'Line 1\r\nLine 2'], // Windows line breaks
    [`  ${'a'.repeat(2000)}\n`, 'a'.repeat(2000)], // the limit counts the trimmed text
    ['Línea fina, 李小龍 🙂', 'Línea fina, 李小龍 🙂'],
  ])('accepts %j as %j', (value, expected) => {
    expect(validated(requestWith('notes', value))['notes']).toBe(expected);
  });

  it.each([
    ['a'.repeat(2001), 'too-long'],
    ['Hi\u0000', 'characters'],
    // Edge cases beyond validation.md.
    ['Hi\u0007 there', 'characters'],
    ['Hi\u007f', 'characters'],
    [`${'a'.repeat(2001)}\u0000`, 'too-long'], // one code: the first rule broken
    [42, 'characters'],
  ])('rejects %j with %s', (value, code) => {
    expect(errorsAt(requestWith('notes', value), 'notes')).toEqual([code]);
  });
});

// validation.md, "consent".
describe('consent', () => {
  it('accepts true', () => {
    expect(validated(requestWith('consent', true))['consent']).toBe(true);
  });

  it.each([
    [false],
    [MISSING],
    // Edge cases beyond validation.md: only the boolean true counts.
    ['true'],
    ['on'],
    [1],
    [null],
  ])('rejects %j with consent', (value) => {
    expect(errorsAt(requestWith('consent', value), 'consent')).toEqual(['consent']);
  });
});

// validation.md, "Whole request".
describe('the whole request', () => {
  it('accepts the full request, with instagram without its @', () => {
    expect(validated({ ...VALID_REQUEST })).toEqual({ ...VALID_REQUEST, instagram: 'ana.lopez_' });
  });

  it('accepts only the required fields and consent', () => {
    const request = {
      name: 'Ana López',
      instagram: 'ana.lopez_',
      email: 'ana@example.com',
      location: 'Madrid / España',
      placement: 'Left forearm',
      dates: { from: '2026-11-10' },
      consent: true,
    };
    expect(validated(request)).toEqual(request);
  });

  it('drops a key that is not in specs/form.md', () => {
    const data = validated({ ...VALID_REQUEST, subject: 'Hello' });
    expect(Object.keys(data)).not.toContain('subject');
  });

  it('drops a key that is not in specs/form.md inside dates', () => {
    const data = validated({
      ...VALID_REQUEST,
      dates: { from: '2026-11-10', until: '2026-12-01' },
    });
    expect(data['dates']).toEqual({ from: '2026-11-10' });
  });

  it('reports every required field of an empty request, and nothing else', () => {
    expect(allErrors({})).toEqual([
      'name: required',
      'instagram: required',
      'email: required',
      'location: required',
      'placement: required',
      'dates.from: required',
      'consent: consent',
    ]);
  });

  it('rejects a request that is not an object', () => {
    expect(createContactSchema(TODAY).safeParse('name=Ana').success).toBe(false);
  });
});
