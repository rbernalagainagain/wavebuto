import { chooseLanguage } from './choose-language';

describe('chooseLanguage', () => {
  // The cases of specs/2026-11-03-two-languages/validation.md.
  it.each([
    ['es', 'es'],
    ['es-ES,es;q=0.9', 'es'],
    ['es-MX', 'es'],
    ['ES-ar', 'es'],
    ['en-US,en;q=0.9,es;q=0.8', 'en'],
    ['fr-FR,es;q=0.9', 'en'],
    ['en;q=0.5,es;q=0.8', 'es'],
    ['es;q=0', 'en'],
    ['*', 'en'],
    ['', 'en'],
    [';;q=x', 'en'],
  ] as const)('chooses %j → %s', (header, expected) => {
    expect(chooseLanguage(header)).toBe(expected);
  });

  it('chooses en when the header is missing', () => {
    expect(chooseLanguage(null)).toBe('en');
  });

  // Edge cases beyond validation.md.
  it.each([
    [' es-ES , en ; q=0.5 ', 'es'], // whitespace around tags and parameters
    ['es;Q=0.9,en;q=0.8', 'es'], // parameter name is case-insensitive
    ['es;q=1.0', 'es'], // q with decimals at the maximum
    ['es;q=0.000', 'en'], // q written as zero with decimals
    ['es;q=2,en;q=0.5', 'en'], // q out of range: the Spanish entry is unreadable
    ['es;q=abc', 'en'], // q not a number: the Spanish entry is unreadable
    ['ca-ES,es;q=0.9', 'en'], // Catalan from Spain is not Spanish
    ['español', 'en'], // not a language tag
    ['esp', 'en'], // a different primary subtag that starts with "es"
    ['en,es', 'en'], // equal weight: the first listed wins
    ['es,en', 'es'],
    ['en;q=0.8,es;q=0.8', 'en'],
  ] as const)('chooses %j → %s', (header, expected) => {
    expect(chooseLanguage(header)).toBe(expected);
  });
});
