import { TestBed } from '@angular/core/testing';
import { ContactForm } from './contact-form';

async function renderContactForm() {
  await TestBed.configureTestingModule({ imports: [ContactForm] }).compileComponents();
  const fixture = TestBed.createComponent(ContactForm);
  await fixture.whenStable();
  return {
    fixture,
    root: fixture.nativeElement as HTMLElement,
    settle: () => fixture.whenStable(),
  };
}

async function createContactForm() {
  return (await renderContactForm()).root;
}

/** The element's text with its whitespace collapsed, as a reader sees it. */
function text(element: Element | null | undefined): string {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

/** The text of a label without the required marker. */
function labelText(label: Element): string {
  return text(label).replace(/ \*$/, '');
}

/** The control tied to the label with this text, through its `for`. */
function controlLabelled(root: HTMLElement, label: string): HTMLInputElement {
  const match = [...root.querySelectorAll('label')].find((each) => labelText(each) === label);
  const control = match?.htmlFor ? root.querySelector(`#${match.htmlFor}`) : null;
  if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
    throw new Error(`No control is tied to a label "${label}"`);
  }
  return control as HTMLInputElement;
}

/** Types `value` into the control, as the person would. */
function type(control: HTMLInputElement, value: string): void {
  control.value = value;
  control.dispatchEvent(new Event('input'));
}

/** Moves the focus out of the control. */
function leave(control: HTMLInputElement): void {
  control.dispatchEvent(new Event('blur'));
}

// Attributes that would state a rule a second time (requirements.md, decision 5).
const NATIVE_CONSTRAINTS = [
  'required',
  'maxlength',
  'minlength',
  'min',
  'max',
  'pattern',
  'placeholder',
];

interface TextFieldCase {
  label: string;
  type: string;
  autocomplete: string | null;
  invalid: string;
  error: string;
  valid: string;
}

/** The behaviour every required single-line text field shares (decisions 5, 6 and 8). */
function itIsARequiredTextField(field: TextFieldCase): void {
  it(`is an input of type ${field.type} tied to its label, required and with no native rule`, async () => {
    const root = await createContactForm();
    const control = controlLabelled(root, field.label);

    expect(control.tagName).toBe('INPUT');
    expect(control.getAttribute('type')).toBe(field.type);
    expect(control.getAttribute('aria-required')).toBe('true');
    expect(control.getAttribute('autocomplete')).toBe(field.autocomplete);
    expect(NATIVE_CONSTRAINTS.filter((name) => control.hasAttribute(name))).toEqual([]);
  });

  it('shows no error while the person is still in the field', async () => {
    const { root, settle } = await renderContactForm();
    const control = controlLabelled(root, field.label);

    type(control, field.invalid);
    await settle();

    expect(control.hasAttribute('aria-invalid')).toBe(false);
    expect(control.hasAttribute('aria-describedby')).toBe(false);
    expect(text(root)).not.toContain(field.error);
  });

  it('shows its error right after it once the person leaves it', async () => {
    const { root, settle } = await renderContactForm();
    const control = controlLabelled(root, field.label);

    type(control, field.invalid);
    leave(control);
    await settle();

    const error = control.nextElementSibling;
    expect(text(error)).toBe(field.error);
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(error?.id).toBeTruthy();
    expect(control.getAttribute('aria-describedby')).toBe(error?.id);
  });

  it('removes the error as soon as the value is valid', async () => {
    const { root, settle } = await renderContactForm();
    const control = controlLabelled(root, field.label);

    type(control, field.invalid);
    leave(control);
    await settle();
    type(control, field.valid);
    await settle();

    expect(control.hasAttribute('aria-invalid')).toBe(false);
    expect(control.hasAttribute('aria-describedby')).toBe(false);
    expect(text(root)).not.toContain(field.error);
  });
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

  describe('01 — Personal information', () => {
    const FIELDS: TextFieldCase[] = [
      {
        label: 'Name',
        type: 'text',
        autocomplete: 'name',
        invalid: '   ',
        error: 'This field is required.',
        valid: 'Ana López',
      },
      {
        label: 'Instagram',
        type: 'text',
        autocomplete: null,
        invalid: 'ana lopez',
        error: 'Enter your Instagram username: letters, numbers, dots and underscores, up to 30.',
        valid: '@ana.lopez_',
      },
      {
        label: 'Email',
        type: 'email',
        autocomplete: 'email',
        invalid: 'ana@',
        error: 'Enter a valid email address, like name@example.com.',
        valid: 'ana@example.com',
      },
      {
        label: 'City / Country',
        type: 'text',
        autocomplete: null,
        invalid: 'x'.repeat(101),
        error: 'This text is too long.',
        valid: 'Madrid / España',
      },
    ];

    it('holds Name, Instagram, Email and City / Country, in that order, each marked required', async () => {
      const root = await createContactForm();
      const labels = [...root.querySelectorAll('form > fieldset:nth-of-type(1) label')].map(text);

      expect(labels).toEqual(['Name *', 'Instagram *', 'Email *', 'City / Country *']);
    });

    describe.each(FIELDS)('$label', itIsARequiredTextField);

    it('shows "required" on a field left empty', async () => {
      const { root, settle } = await renderContactForm();
      const control = controlLabelled(root, 'Email');

      leave(control);
      await settle();

      expect(text(control.nextElementSibling)).toBe('This field is required.');
    });
  });

  describe('02 — Tattoo', () => {
    it('holds Body placement, then the symmetry question', async () => {
      const root = await createContactForm();
      const group = root.querySelector('form > fieldset:nth-of-type(2)');

      expect(text(group?.querySelector(':scope > div > label'))).toBe('Body placement *');
      expect(text(group?.querySelector(':scope > fieldset > legend'))).toBe(
        'Symmetrical or asymmetrical?',
      );
      expect([...(group?.children ?? [])].map((child) => child.tagName)).toEqual([
        'LEGEND',
        'DIV',
        'FIELDSET',
      ]);
    });

    describe('Body placement', () => {
      itIsARequiredTextField({
        label: 'Body placement',
        type: 'text',
        autocomplete: null,
        invalid: 'Left\tforearm',
        error: 'This text contains characters that are not allowed.',
        valid: 'Left forearm',
      });
    });

    describe('Symmetrical or asymmetrical?', () => {
      function symmetryGroup(root: HTMLElement): HTMLFieldSetElement {
        const group = root.querySelector('form > fieldset:nth-of-type(2) > fieldset');
        if (!(group instanceof HTMLFieldSetElement)) {
          throw new Error('No symmetry fieldset');
        }
        return group;
      }

      it('is a radio group named by its legend, with one labelled radio per option, none chosen', async () => {
        const root = await createContactForm();
        const group = symmetryGroup(root);
        const radios = [...group.querySelectorAll('input')];

        expect(group.getAttribute('role')).toBe('radiogroup');
        expect(
          radios.map((radio) => [radio.type, radio.value, labelText(radio.labels?.[0] as Element)]),
        ).toEqual([
          ['radio', 'symmetrical', 'Symmetrical'],
          ['radio', 'asymmetrical', 'Asymmetrical'],
          ['radio', 'not-sure', 'Not sure'],
        ]);
        expect(radios.some((radio) => radio.checked)).toBe(false);
        expect(new Set(radios.map((radio) => radio.name)).size).toBe(1);
        expect(radios[0].name).not.toBe('');
      });

      it('is optional: nothing marks it required', async () => {
        const root = await createContactForm();
        const group = symmetryGroup(root);

        expect(text(group.querySelector('legend'))).not.toContain('*');
        expect(group.querySelectorAll('[aria-required], [required]').length).toBe(0);
        expect(group.hasAttribute('aria-required')).toBe(false);
      });

      it('takes the chosen option and shows no error', async () => {
        const { root, settle } = await renderContactForm();
        const group = symmetryGroup(root);
        const notSure = group.querySelector<HTMLInputElement>('input[value="not-sure"]');

        notSure?.click();
        leave(notSure as HTMLInputElement);
        await settle();

        expect(notSure?.checked).toBe(true);
        expect(group.hasAttribute('aria-invalid')).toBe(false);
        expect(group.nextElementSibling).toBeNull();
      });

      it('shows its error right after the group, tied to the group', async () => {
        const { fixture, root, settle } = await renderContactForm();
        // No radio can choose a value outside the options, so the model is
        // set directly, as a tampered page would.
        fixture.componentInstance['model'].update((model) => ({
          ...model,
          symmetry: 'Symmetrical',
        }));
        fixture.componentInstance['contactForm'].symmetry().markAsTouched();
        await settle();

        const group = symmetryGroup(root);
        const error = group.nextElementSibling;
        expect(text(error)).toBe('Choose one of the options.');
        expect(group.getAttribute('aria-invalid')).toBe('true');
        expect(error?.id).toBeTruthy();
        expect(group.getAttribute('aria-describedby')).toBe(error?.id);
      });
    });
  });

  it('loads nothing', async () => {
    const root = await createContactForm();
    expect(root.querySelectorAll('[src], [href]').length).toBe(0);
  });
});
