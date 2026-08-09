import { RenderMode, ServerRoute } from '@angular/ssr';

// Render mode per route. Keep in sync with app.routes.ts.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
];
