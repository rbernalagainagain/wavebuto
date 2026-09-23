import { TestBed } from '@angular/core/testing';
import { provideAppTransloco } from '../i18n/transloco';
import { provideBundledTranslations } from '../i18n/bundled-translations';
import { Home } from './home';

async function createHome() {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [provideAppTransloco(), provideBundledTranslations()],
  }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  it('renders exactly three sections, #home, #gallery and #contact, in that order', async () => {
    const root = await createHome();
    const sections = Array.from(root.querySelectorAll('section'));
    expect(sections.map((section) => section.id)).toEqual(['home', 'gallery', 'contact']);
  });

  it('labels each section by its heading', async () => {
    const root = await createHome();
    for (const section of Array.from(root.querySelectorAll('section'))) {
      const labelId = section.getAttribute('aria-labelledby')!;
      const heading = root.querySelector(`#${labelId}`)!;
      expect(heading).not.toBeNull();
      expect(section.contains(heading)).toBe(true);
      expect(heading.tagName).toMatch(/^H[12]$/);
      expect(heading.textContent?.trim()).not.toBe('');
    }
  });

  it('opens the landing section with the one h1 and two short paragraphs', async () => {
    const root = await createHome();
    expect(root.querySelectorAll('h1').length).toBe(1);

    const landing = root.querySelector('#home')!;
    expect(landing.querySelector('h1')).not.toBeNull();
    const paragraphs = landing.querySelectorAll(':scope > p');
    expect(paragraphs.length).toBe(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.textContent?.trim()).not.toBe('');
    }
  });

  it('shows images from public/ with descriptive alt text and explicit dimensions', async () => {
    const root = await createHome();
    const gallery = root.querySelector('#gallery')!;
    expect(gallery.querySelector('h2')?.textContent?.trim()).not.toBe('');

    const images = Array.from(gallery.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute('src')).toMatch(/^gallery\/[\w-]+\.svg$/);
      expect(image.getAttribute('alt')?.trim()).not.toBe('');
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
    }
  });

  it('mounts the contact form in #contact, under an h2 reading "Get in touch"', async () => {
    const root = await createHome();
    const contact = root.querySelector('#contact')!;

    const heading = contact.querySelector('h2')!;
    expect(heading.textContent?.trim()).toBe('Get in touch');

    const form = contact.querySelector('form')!;
    expect(form).not.toBeNull();
    expect(heading.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(root.querySelectorAll('form').length).toBe(1);
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
