import { Routes } from '@angular/router';
import { Home } from './home/home';

// Exactly the one route declared in spec.md §1. Keep in sync with app.routes.server.ts.
export const routes: Routes = [{ path: '', component: Home, title: 'Wavebuto' }];
