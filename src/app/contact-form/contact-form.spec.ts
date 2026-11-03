import { TestBed } from '@angular/core/testing';
import { ContactForm } from './contact-form';

async function createContactForm() {
  await TestBed.configureTestingModule({ imports: [ContactForm] }).compileComponents();
  const fixture = TestBed.createComponent(ContactForm);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

/** The element's text with its whitespace collapsed, as a reader sees it. */
function text(element: Element | null | undefined): string {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('ContactForm', () => {
  describe('header (specs/form.md, "Header")', () => {
    it('shows the eyebrow, the title as a level-two heading and the required legend', async () => {
      const root = await createContactForm();
      const header = root.querySelector(':scope > header');

      expect([...(header?.children ?? [])].map((child) => [child.tagName, text(child)])).toEqual([
        ['P', 'Bookings'],
        ['H2', 'Tattoo appointment'],
        ['P', '* Required'],
      ]);
    });
  });

  describe('form', () => {
    it('has novalidate, so the browser never checks a rule of its own', async () => {
      const root = await createContactForm();
      expect(root.querySelector('form')?.hasAttribute('novalidate')).toBe(true);
    });

    it('holds the four groups, the privacy notice, the button and the notice, in that order', async () => {
      const root = await createContactForm();
      const form = root.querySelector('form');

      expect([...(form?.children ?? [])].map((child) => child.tagName)).toEqual([
        'FIELDSET',
        'FIELDSET',
        'FIELDSET',
        'FIELDSET',
        'P',
        'BUTTON',
        'P',
      ]);
    });

    it('titles each group with its legend', async () => {
      const root = await createContactForm();
      const legends = [...root.querySelectorAll('form > fieldset > legend')].map(text);

      expect(legends).toEqual([
        '01 — Personal information',
        '02 — Tattoo',
        '03 — Availability',
        '04 — Additional information',
      ]);
    });

    it('shows the placeholder privacy notice, with the address as plain text', async () => {
      const root = await createContactForm();
      const privacy = root.querySelector('form > p');

      expect(text(privacy)).toBe(
        'Your details reach me by email and I use them only to answer this request. ' +
          'I do not share them with anyone. To have them deleted, write to me at ' +
          'hello@wavebuto.example.',
      );
      expect(privacy?.querySelector('a')).toBeNull();
    });

    it('ends with the send button and the notice', async () => {
      const root = await createContactForm();
      const button = root.querySelector('form > button');

      expect(button?.getAttribute('type')).toBe('submit');
      expect(text(button)).toBe('Send request');
      expect(text(root.querySelector('form > button + p'))).toBe(
        'Submitting this form does not guarantee an appointment. ' +
          'I will review your request and contact you personally.',
      );
    });
  });

  it('loads nothing', async () => {
    const root = await createContactForm();
    expect(root.querySelectorAll('[src], [href]').length).toBe(0);
  });
});
