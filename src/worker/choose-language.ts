export type Language = 'en' | 'es';

// A language range of RFC 9110 §12.5.4: "*" or a tag of letters and digits.
const LANGUAGE_RANGE = /^(\*|[a-z]{1,8}(-[a-z0-9]{1,8})*)$/i;
// A weight of RFC 9110 §12.4.2: 0 to 1, with up to three decimals.
const WEIGHT = /^(0(\.\d{0,3})?|1(\.0{0,3})?)$/;

/**
 * The language of the page `/` redirects to (specs/mission.md): Spanish only
 * when the visitor's most-wanted language is a variant of Spanish, English in
 * every other case, including a missing or unreadable header. Entries that
 * cannot be read are skipped; among equal weights, the first listed wins.
 */
export function chooseLanguage(acceptLanguage: string | null): Language {
  let best: { range: string; weight: number } | undefined;

  for (const entry of (acceptLanguage ?? '').split(',')) {
    const [range, ...parameters] = entry.split(';').map((part) => part.trim());
    if (!LANGUAGE_RANGE.test(range)) {
      continue;
    }

    let weight = 1;
    let readable = true;
    for (const parameter of parameters) {
      const [name, value = ''] = parameter.split('=').map((part) => part.trim());
      if (name.toLowerCase() === 'q') {
        readable = WEIGHT.test(value);
        weight = Number(value);
      }
    }
    if (!readable || weight === 0) {
      continue;
    }

    if (best === undefined || weight > best.weight) {
      best = { range, weight };
    }
  }

  const primary = best?.range.split('-')[0].toLowerCase();
  return primary === 'es' ? 'es' : 'en';
}
