import { TestBed } from '@angular/core/testing';
import { ContactForm } from './contact-form';

function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
}

function fakeResponse(ok: boolean): Response {
  return { ok } as Response;
}

async function createForm() {
  await TestBed.configureTestingModule({ imports: [ContactForm] }).compileComponents();
  const fixture = TestBed.createComponent(ContactForm);
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  const name = root.querySelector<HTMLInputElement>('#name')!;
  const email = root.querySelector<HTMLInputElement>('#email')!;
  const subject = root.querySelector<HTMLSelectElement>('#subject')!;
  const message = root.querySelector<HTMLTextAreaElement>('#message')!;
  const form = root.querySelector<HTMLFormElement>('form')!;
  return { fixture, root, name, email, subject, message, form };
}

function fillValid(controls: {
  name: HTMLInputElement;
  email: HTMLInputElement;
  subject: HTMLSelectElement;
  message: HTMLTextAreaElement;
}) {
  setValue(controls.name, '  Ada Lovelace  ');
  setValue(controls.email, 'ada@example.com');
  setValue(controls.subject, 'general');
  setValue(controls.message, 'Hello, this is a valid message.');
}

async function submitAndWait(fixture: { detectChanges(): void }, form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  fixture.detectChanges();
  await Promise.resolve();
  await Promise.resolve();
  fixture.detectChanges();
}

describe('ContactForm submission', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('states what happens to the submission before sending', async () => {
    const { root } = await createForm();
    expect(root.textContent).toContain(
      "We'll use your message to reply to you. We don't store it for anything else.",
    );
  });

  it('disables the submit button and shows "Sending…" while submitting', async () => {
    let resolveFetch!: (value: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise<Response>((resolve) => (resolveFetch = resolve))),
    );

    const { fixture, root, form } = await createForm();
    fillValid({
      name: root.querySelector('#name')!,
      email: root.querySelector('#email')!,
      subject: root.querySelector('#subject')!,
      message: root.querySelector('#message')!,
    });

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    const button = root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Sending…');

    resolveFetch(fakeResponse(true));
  });

  it('sends the trimmed field values as the payload', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(fakeResponse(true));
    vi.stubGlobal('fetch', fetchSpy);

    const { fixture, root, form } = await createForm();
    fillValid({
      name: root.querySelector('#name')!,
      email: root.querySelector('#email')!,
      subject: root.querySelector('#subject')!,
      message: root.querySelector('#message')!,
    });

    await submitAndWait(fixture, form);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'general',
      message: 'Hello, this is a valid message.',
    });
  });

  it('on success, replaces the form with a thank-you message and moves focus to it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(true)));

    const { fixture, root, form } = await createForm();
    fillValid({
      name: root.querySelector('#name')!,
      email: root.querySelector('#email')!,
      subject: root.querySelector('#subject')!,
      message: root.querySelector('#message')!,
    });

    await submitAndWait(fixture, form);
    await Promise.resolve();
    fixture.detectChanges();

    expect(root.querySelector('form')).toBeNull();
    const success = root.querySelector('p');
    expect(success?.textContent).toBe("Thanks — we'll get back to you.");
    expect(document.activeElement).toBe(success);
  });

  it('on a non-2xx response, keeps the form with values intact and shows a failure alert', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(false)));

    const { fixture, root, form } = await createForm();
    fillValid({
      name: root.querySelector('#name')!,
      email: root.querySelector('#email')!,
      subject: root.querySelector('#subject')!,
      message: root.querySelector('#message')!,
    });

    await submitAndWait(fixture, form);

    expect(root.querySelector('form')).not.toBeNull();
    const name = root.querySelector<HTMLInputElement>('#name')!;
    expect(name.value).toBe('  Ada Lovelace  ');

    const alert = root.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("That didn't send.");

    const button = root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.disabled).toBe(false);
  });

  it('on a network error, shows the same failure state as a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { fixture, root, form } = await createForm();
    fillValid({
      name: root.querySelector('#name')!,
      email: root.querySelector('#email')!,
      subject: root.querySelector('#subject')!,
      message: root.querySelector('#message')!,
    });

    await submitAndWait(fixture, form);

    expect(root.querySelector('form')).not.toBeNull();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain("That didn't send.");
  });
});
