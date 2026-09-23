import {
  EnvironmentProviders,
  Provider,
  inject,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { TranslationHttpLoader } from './translation-http-loader';

export function provideAppTransloco(): (Provider | EnvironmentProviders)[] {
  return [
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        reRenderOnLangChange: false,
        prodMode: !isDevMode(),
      },
      loader: TranslationHttpLoader,
    }),
    // The page arrives prerendered with its copy in place. Hydration waits for
    // the translations so the first client render repaints the same text rather
    // than blanking it while the request is in flight. A failed load still lets
    // the app start: Transloco then shows keys, which is visible, not silent.
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return new Promise<void>((resolve) => {
        transloco.load(transloco.getDefaultLang()).subscribe({
          complete: () => resolve(),
          error: () => resolve(),
        });
      });
    }),
  ];
}
