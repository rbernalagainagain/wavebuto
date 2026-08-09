import { Routes } from '@angular/router';
import { About } from './about/about';
import { Home } from './home/home';

// Exactly the two routes declared in spec.md §1. Keep in sync with app.routes.server.ts.
export const routes: Routes = [
  { path: '', component: Home, title: 'Wavebuto' },
  { path: 'about', component: About, title: 'About — Wavebuto' },
];
