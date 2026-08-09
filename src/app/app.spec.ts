import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

async function createApp() {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter(routes)],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('App shell', () => {
  it('creates the app', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('shares a header with the site name and a link to each of the two routes', async () => {
    const root = await createApp();
    const header = root.querySelector('header')!;

    expect(header.textContent).toContain('Wavebuto');
    const links = Array.from(header.querySelectorAll('a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/about']);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Home', 'About']);
  });

  it('shares a footer with the site name and the year', async () => {
    const root = await createApp();
    const footer = root.querySelector('footer')!;

    expect(footer.textContent).toContain('Wavebuto');
    expect(footer.textContent).toContain(String(new Date().getFullYear()));
  });

  it('renders routed pages through an outlet', async () => {
    const root = await createApp();
    expect(root.querySelector('main')).not.toBeNull();
    expect(root.querySelector('main router-outlet')).not.toBeNull();
  });

  it('declares exactly the two routes in spec.md §1', () => {
    expect(routes.map((route) => route.path)).toEqual(['', 'about']);
  });
});
