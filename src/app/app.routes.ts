import { Routes } from '@angular/router';
import { Home } from './home/home';

// The one page. Keep in sync with app.routes.server.ts.
export const routes: Routes = [{ path: '', component: Home, title: 'Wavebuto' }];
