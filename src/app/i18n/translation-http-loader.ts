import { Injectable } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';

// The site's second and last network door (CONSTITUTION.md §2.1): it reads the
// site's own translation files, served same-origin from public/i18n/. It sends
// nothing about the user; a GET for a static file is all it ever makes.
@Injectable({ providedIn: 'root' })
export class TranslationHttpLoader implements TranslocoLoader {
  async getTranslation(lang: string): Promise<Translation> {
    const response = await fetch(`/i18n/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Translations for "${lang}" answered ${response.status}.`);
    }
    return response.json();
  }
}
