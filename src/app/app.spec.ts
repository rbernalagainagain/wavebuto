import { Location, ViewportScroller } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';
import { provideAppTransloco } from './i18n/transloco';
import { provideBundledTranslations } from './i18n/bundled-translations';

async function createApp() {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter(routes), provideAppTransloco(), provideBundledTranslations()],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('App shell', () => {
  it('creates the app', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideAppTransloco(), provideBundledTranslations()],
    }).compileComponents();
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('has a header with the site name and an in-page link to each of the three sections', async () => {
    const root = await createApp();
    const header = root.querySelector('header')!;

    expect(header.textContent).toContain('Wavebuto');
    const links = Array.from(header.querySelectorAll('a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/#home',
      '/#gallery',
      '/#contact',
    ]);
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Home', 'Gallery', 'Contact']);
  });

  it('has a footer with the site name and the year', async () => {
    const root = await createApp();
    const footer = root.querySelector('footer')!;

    expect(footer.textContent).toContain('Wavebuto');
    expect(footer.textContent).toContain(String(new Date().getFullYear()));
  });

  it('renders the page through an outlet', async () => {
    const root = await createApp();
    expect(root.querySelector('main')).not.toBeNull();
    expect(root.querySelector('main router-outlet')).not.toBeNull();
  });

  it('declares exactly the one route in spec.md §1, in both route files', () => {
    expect(routes.map((route) => route.path)).toEqual(['']);
    expect(serverRoutes.map((route) => route.path)).toEqual(['']);
  });
});

describe('App shell scrolling', () => {
  it('offsets anchor scrolling by the sticky header height', async () => {
    const setOffset = vi.fn();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideAppTransloco(),
        provideBundledTranslations(),
        { provide: ViewportScroller, useValue: { setOffset } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const header = (fixture.nativeElement as HTMLElement).querySelector('header')!;
    vi.spyOn(header, 'offsetHeight', 'get').mockReturnValue(88);
    const offset = setOffset.mock.calls[0][0] as () => [number, number];
    expect(offset()).toEqual([0, 88]);
  });
});

describe('App shell address bar', () => {
  async function createAppAt(url: string) {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        provideAppTransloco(),
        provideBundledTranslations(),
      ],
    }).compileComponents();
    TestBed.inject(Location).replaceState(url);
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps the address at / when a section link is followed', async () => {
    const fixture = await createAppAt('/');
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLAnchorElement>('header a[href="/#gallery"]')!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/#gallery');
    expect(TestBed.inject(Location).path(true)).toBe('/');
  });

  it('drops a fragment the page was opened with from the address', async () => {
    const fixture = await createAppAt('/#contact');
    await fixture.whenStable();

    expect(TestBed.inject(Location).path(true)).toBe('/');
  });
});
