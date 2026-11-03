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

/** The fieldset whose legend reads `legend`, without the required marker. */
function fieldsetByLegend(root: HTMLElement, legend: string): HTMLFieldSetElement {
  const match = [...root.querySelectorAll('legend')].find((each) => labelText(each) === legend);
  const group = match?.parentElement;
  if (!(group instanceof HTMLFieldSetElement)) {
    throw new Error(`No fieldset has the legend "${legend}"`);
  }
  return group;
}

interface RadioGroupCase {
  key: 'symmetry' | 'flexibleDates' | 'tattooHistory';
  legend: string;
  /** Each option's value and label, in order. */
  options: [string, string][];
  /** A value that is not one of the options. */
  outside: string;
}

/** The behaviour every optional radio group shares (decisions 6 and 8). */
function itIsAnOptionalRadioGroup(radio: RadioGroupCase): void {
  it('is a radio group named by its legend, with one labelled radio per option, none chosen', async () => {
    const root = await createContactForm();
    const group = fieldsetByLegend(root, radio.legend);
    const radios = [...group.querySelectorAll('input')];

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(
      radios.map((each) => [each.type, each.value, labelText(each.labels?.[0] as Element)]),
    ).toEqual(radio.options.map(([value, label]) => ['radio', value, label]));
    expect(radios.some((each) => each.checked)).toBe(false);
    expect(new Set(radios.map((each) => each.name)).size).toBe(1);
    expect(radios[0].name).not.toBe('');
  });

  it('is optional: nothing marks it required', async () => {
    const root = await createContactForm();
    const group = fieldsetByLegend(root, radio.legend);

    expect(text(group.querySelector('legend'))).not.toContain('*');
    expect(group.querySelectorAll('[aria-required], [required]').length).toBe(0);
    expect(group.hasAttribute('aria-required')).toBe(false);
  });

  it('takes the chosen option and shows no error', async () => {
    const { root, settle } = await renderContactForm();
    const group = fieldsetByLegend(root, radio.legend);
    const [value] = radio.options[radio.options.length - 1];
    const option = group.querySelector<HTMLInputElement>(`input[value="${value}"]`);

    option?.click();
    leave(option as HTMLInputElement);
    await settle();

    expect(option?.checked).toBe(true);
    expect(group.hasAttribute('aria-invalid')).toBe(false);
    expect(text(root)).not.toContain('Choose one of the options.');
  });

  it('shows its error right after the group, tied to the group', async () => {
    const { fixture, root, settle } = await renderContactForm();
    // No radio can choose a value outside the options, so the model is set
    // directly, as a tampered page would.
    fixture.componentInstance['model'].update((model) => ({
      ...model,
      [radio.key]: radio.outside,
    }));
    fixture.componentInstance['contactForm'][radio.key]().markAsTouched();
    await settle();

    const group = fieldsetByLegend(root, radio.legend);
    const error = group.nextElementSibling;
    expect(text(error)).toBe('Choose one of the options.');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(error?.id).toBeTruthy();
    expect(group.getAttribute('aria-describedby')).toBe(error?.id);
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
      itIsAnOptionalRadioGroup({
        key: 'symmetry',
        legend: 'Symmetrical or asymmetrical?',
        options: [
          ['symmetrical', 'Symmetrical'],
          ['asymmetrical', 'Asymmetrical'],
          ['not-sure', 'Not sure'],
        ],
        outside: 'Symmetrical',
      });
    });
  });

  describe('03 — Availability', () => {
    // validation.md's cases use this date as today.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 10, 3, 12, 0));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('holds the preferred dates, then the flexible dates question', async () => {
      const root = await createContactForm();
      const group = root.querySelector('form > fieldset:nth-of-type(3)');

      expect([...(group?.querySelectorAll(':scope > fieldset > legend') ?? [])].map(text)).toEqual([
        'Preferred date / dates *',
        'Are you flexible with dates?',
      ]);
      expect([...(group?.children ?? [])].map((child) => child.tagName)).toEqual([
        'LEGEND',
        'FIELDSET',
        'FIELDSET',
      ]);
    });

    describe('Preferred date / dates', () => {
      it('is a group of two date inputs, From (required) and To (optional), with no native rule', async () => {
        const root = await createContactForm();
        const from = controlLabelled(root, 'From');
        const to = controlLabelled(root, 'To');

        expect(fieldsetByLegend(root, 'Preferred date / dates').contains(from)).toBe(true);
        expect(fieldsetByLegend(root, 'Preferred date / dates').contains(to)).toBe(true);
        expect([from.type, to.type]).toEqual(['date', 'date']);
        expect(text(from.labels?.[0])).toBe('From *');
        expect(text(to.labels?.[0])).toBe('To');
        expect(from.getAttribute('aria-required')).toBe('true');
        expect(to.hasAttribute('aria-required')).toBe(false);
        for (const control of [from, to]) {
          expect(NATIVE_CONSTRAINTS.filter((name) => control.hasAttribute(name))).toEqual([]);
        }
      });

      it('shows "required" on From when it is left empty', async () => {
        const { root, settle } = await renderContactForm();
        const from = controlLabelled(root, 'From');

        leave(from);
        await settle();

        expect(text(from.nextElementSibling)).toBe('This field is required.');
      });

      it('shows a past From on From, tied to it, until it is today or later', async () => {
        const { root, settle } = await renderContactForm();
        const from = controlLabelled(root, 'From');

        type(from, '2026-11-02');
        leave(from);
        await settle();

        const error = from.nextElementSibling;
        expect(text(error)).toBe('Choose today or a later date.');
        expect(from.getAttribute('aria-invalid')).toBe('true');
        expect(from.getAttribute('aria-describedby')).toBe(error?.id);

        type(from, '2026-11-03');
        await settle();

        expect(from.hasAttribute('aria-invalid')).toBe(false);
        expect(text(root)).not.toContain('Choose today or a later date.');
      });

      it('shows a To before From on To, not on From', async () => {
        const { root, settle } = await renderContactForm();
        const from = controlLabelled(root, 'From');
        const to = controlLabelled(root, 'To');

        type(from, '2026-11-10');
        leave(from);
        type(to, '2026-11-09');
        leave(to);
        await settle();

        const error = to.nextElementSibling;
        expect(text(error)).toBe('"To" can\'t be before "From".');
        expect(to.getAttribute('aria-invalid')).toBe('true');
        expect(to.getAttribute('aria-describedby')).toBe(error?.id);
        expect(from.hasAttribute('aria-invalid')).toBe(false);
      });

      it('takes a single day, with To left empty, and a range', async () => {
        const { root, settle } = await renderContactForm();
        const from = controlLabelled(root, 'From');
        const to = controlLabelled(root, 'To');

        type(from, '2026-11-03');
        leave(from);
        leave(to);
        await settle();
        expect(root.querySelectorAll('[aria-invalid]').length).toBe(0);

        type(to, '2026-11-20');
        await settle();
        expect(root.querySelectorAll('[aria-invalid]').length).toBe(0);
      });
    });

    describe('Are you flexible with dates?', () => {
      itIsAnOptionalRadioGroup({
        key: 'flexibleDates',
        legend: 'Are you flexible with dates?',
        options: [
          ['yes', 'Yes'],
          ['no', 'No'],
        ],
        outside: 'Yes',
      });
    });
  });

  it('loads nothing', async () => {
    const root = await createContactForm();
    expect(root.querySelectorAll('[src], [href]').length).toBe(0);
  });
});
