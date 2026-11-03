import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

describe('App shell', () => {
  it('renders the page through an outlet inside main', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('main router-outlet')).not.toBeNull();
  });

  it('declares the same single route in both route files', () => {
    expect(routes.map((route) => route.path)).toEqual(['']);
    expect(serverRoutes.map((route) => route.path)).toEqual(['']);
  });
});
