import { contactFormSchema } from './contact-schema';

const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  subject: 'support',
  message: 'Hello there',
};

describe('contactFormSchema', () => {
  it('accepts a valid submission', () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true);
  });

  it('outputs the four trimmed values and nothing else (spec.md §5 payload)', () => {
    const result = contactFormSchema.parse({
      name: '  Ada  ',
      email: ' ada@example.com ',
      subject: ' support ',
      message: '  Hello there  ',
      extra: 'dropped',
    });
    expect(result).toEqual(valid);
  });

  it('rejects the submission when any single field fails', () => {
    for (const field of Object.keys(valid) as (keyof typeof valid)[]) {
      expect(contactFormSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
    }
  });

  it('reports each failing field under its own path', () => {
    const result = contactFormSchema.safeParse({ name: '', email: '', subject: '', message: '' });
    expect(result.success).toBe(false);
    const paths = new Set(result.error?.issues.map((issue) => issue.path[0]));
    expect(paths).toEqual(new Set(['name', 'email', 'subject', 'message']));
  });
});
