import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

async function createHome() {
  // The introduction's Bookings link is a routerLink, which needs a router.
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  it('has the logo as its only heading, and the introduction before the contact section', async () => {
    const root = await createHome();

    const headings = root.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].querySelector('img')?.getAttribute('alt')).toBe('Wavebuto');

    const introduction = root.querySelector(':scope > app-introduction');
    const contact = root.querySelector(':scope > section#contact');
    expect(introduction).not.toBeNull();
    expect(contact).not.toBeNull();
    expect(
      introduction!.compareDocumentPosition(contact!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('places the form in the section with the contact anchor', async () => {
    const root = await createHome();

    expect(root.querySelector(':scope > section#contact > app-contact-form form')).not.toBeNull();
  });

  it('loads nothing off-origin', async () => {
    const root = await createHome();

    for (const element of root.querySelectorAll('[src], [href]')) {
      for (const value of [element.getAttribute('src'), element.getAttribute('href')]) {
        if (value === null) continue;
        // A same-origin path: no scheme and no leading "//".
        expect(value).not.toMatch(/^[a-z][a-z0-9+.-]*:/i);
        expect(value.startsWith('//')).toBe(false);
      }
    }
  });
});
