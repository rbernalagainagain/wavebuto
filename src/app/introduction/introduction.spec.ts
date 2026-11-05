import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Introduction } from './introduction';

async function createIntroduction() {
  await TestBed.configureTestingModule({
    imports: [Introduction],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(Introduction);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

/** The text a screen reader reads: without what is `aria-hidden`, whitespace collapsed. */
function readableText(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return copy.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function header(root: HTMLElement): HTMLElement {
  const found = root.querySelector<HTMLElement>(':scope > header');
  if (!found) {
    throw new Error('The introduction has no <header>');
  }
  return found;
}

describe('Introduction', () => {
  describe('Hero', () => {
    it('holds the Bookings link, the heading and the torso photo, in that order', async () => {
      const root = await createIntroduction();

      const children = [...header(root).children].map((child) => child.tagName);
      expect(children).toEqual(['A', 'H1', 'IMG']);
    });

    it('links Bookings to the contact anchor, with its arrow hidden from screen readers', async () => {
      const root = await createIntroduction();
      const link = header(root).querySelector(':scope > a') as HTMLAnchorElement;

      expect(readableText(link)).toBe('Bookings');
      expect(link.textContent).toBe('Bookings →');
      expect(link.getAttribute('href')).toMatch(/#contact$/);

      const arrow = link.querySelector('[aria-hidden="true"]');
      expect(arrow?.textContent?.trim()).toBe('→');
    });

    it('makes the logo the heading, and nothing else', async () => {
      const root = await createIntroduction();
      const heading = header(root).querySelector(':scope > h1') as HTMLHeadingElement;

      expect(heading.children.length).toBe(1);
      expect(heading.textContent?.trim()).toBe('');

      const logo = heading.querySelector(':scope > img') as HTMLImageElement;
      expect(logo.getAttribute('alt')).toBe('Wavebuto');
      expect(logo.getAttribute('src')).toBe('web/logo-wavebuto.svg');
      expect(logo.getAttribute('width')).toBe('165');
      expect(logo.getAttribute('height')).toBe('187');
      expect(logo.getAttribute('loading')).not.toBe('lazy');
    });

    it('shows the torso photo with its alternative text and size', async () => {
      const root = await createIntroduction();
      const photo = header(root).querySelector(':scope > img') as HTMLImageElement;

      expect(photo.getAttribute('alt')).toBe('Black line tattoo across a torso');
      expect(photo.getAttribute('src')).toBe('web/intro-torso.webp');
      expect(photo.getAttribute('width')).toBe('724');
      expect(photo.getAttribute('height')).toBe('1024');
      expect(photo.getAttribute('loading')).not.toBe('lazy');
    });
  });

  it('has no link other than Bookings', async () => {
    const root = await createIntroduction();

    const links = [...root.querySelectorAll('a')].map(readableText);
    expect(links).toEqual(['Bookings']);
  });

  it('gives every image its width and height', async () => {
    const root = await createIntroduction();

    const images = root.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.getAttribute('width')).toMatch(/^\d+$/);
      expect(image.getAttribute('height')).toMatch(/^\d+$/);
    }
  });
});
