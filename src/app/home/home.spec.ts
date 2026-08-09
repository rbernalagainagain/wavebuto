import { TestBed } from '@angular/core/testing';
import { Home } from './home';

async function createHome() {
  await TestBed.configureTestingModule({ imports: [Home] }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  it('renders one h1 and two short paragraphs of page content', async () => {
    const root = await createHome();

    const headings = root.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).not.toBe('');

    const paragraphs = root.querySelectorAll(':scope > p');
    expect(paragraphs.length).toBe(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.textContent?.trim()).not.toBe('');
    }
  });

  it('mounts the contact form below the page content, under an h2 reading "Get in touch"', async () => {
    const root = await createHome();

    const heading = root.querySelector('h2')!;
    expect(heading.textContent?.trim()).toBe('Get in touch');

    const form = root.querySelector('form')!;
    expect(form).not.toBeNull();
    expect(heading.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const h1 = root.querySelector('h1')!;
    expect(h1.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('loads nothing off-origin', async () => {
    const root = await createHome();
    for (const element of root.querySelectorAll('[src], [href]')) {
      const url = element.getAttribute('src') ?? element.getAttribute('href') ?? '';
      expect(url.startsWith('//')).toBe(false);
      expect(/^[a-z][a-z0-9+.-]*:/i.test(url)).toBe(false);
    }
  });
});
