import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withI18nSupport } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    // The prerendered page is hydrated, not rendered again. Every component
    // has i18n blocks, and without i18n support Angular skips hydrating them
    // (each gets ngSkipHydration) and builds their DOM again in the browser.
    provideClientHydration(withI18nSupport()),
  ],
};
