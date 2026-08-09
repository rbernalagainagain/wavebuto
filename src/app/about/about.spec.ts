import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { About } from './about';

async function createAbout() {
  await TestBed.configureTestingModule({
    imports: [About],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(About);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('About', () => {
  it('renders one h1 and three short paragraphs of page content', async () => {
    const root = await createAbout();

    const headings = root.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).not.toBe('');

    const paragraphs = root.querySelectorAll(':scope > p');
    expect(paragraphs.length).toBe(3);
    for (const paragraph of paragraphs) {
      expect(paragraph.textContent?.trim()).not.toBe('');
    }
  });

  it('links back to the home page', async () => {
    const root = await createAbout();
    const link = root.querySelector<HTMLAnchorElement>('a[href="/"]')!;

    expect(link).not.toBeNull();
    expect(link.textContent?.trim()).not.toBe('');
  });

  it('carries no form, and loads nothing off-origin', async () => {
    const root = await createAbout();

    expect(root.querySelector('form')).toBeNull();
    for (const element of root.querySelectorAll('[src], [href]')) {
      const url = element.getAttribute('src') ?? element.getAttribute('href') ?? '';
      expect(url.startsWith('//')).toBe(false);
      expect(/^[a-z][a-z0-9+.-]*:/i.test(url)).toBe(false);
    }
  });
});
