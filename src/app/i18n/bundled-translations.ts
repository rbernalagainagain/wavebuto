import { Injectable, Provider } from '@angular/core';
import { TRANSLOCO_LOADER, type Translation, type TranslocoLoader } from '@jsverse/transloco';
import { of, type Observable } from 'rxjs';
import en from '../../../public/i18n/en.json';

// Where no same-origin server exists to fetch from — the build-time prerender
// (Node) and the unit tests (jsdom) — the same translation file is bundled in
// and answered synchronously, so the prerendered HTML carries the copy. The
// browser build never imports this file and fetches the translations instead.
@Injectable({ providedIn: 'root' })
class BundledTranslationLoader implements TranslocoLoader {
  getTranslation(): Observable<Translation> {
    return of(en);
  }
}

/** Replaces the HTTP loader of provideAppTransloco(); list it after that. */
export function provideBundledTranslations(): Provider {
  return { provide: TRANSLOCO_LOADER, useClass: BundledTranslationLoader };
}
