import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAppTransloco } from './i18n/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // The address is always "/" (section links skip the location change), so on
    // a refresh the browser would restore the last scroll position and open on
    // whichever section was last visited. 'top' makes the router take scroll
    // restoration over from the browser (history.scrollRestoration = 'manual'),
    // so a refresh opens at the landing section. Anchor links still scroll to
    // their section; 'top' only applies to navigations without a fragment.
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    provideClientHydration(),
    provideAppTransloco(),
  ],
};
