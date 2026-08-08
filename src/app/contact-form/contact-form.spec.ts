import { TestBed } from '@angular/core/testing';
import { ContactForm } from './contact-form';

function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
}

function blur(el: HTMLElement) {
  el.dispatchEvent(new Event('blur'));
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
  const submitButton = root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  return { fixture, root, name, email, subject, message, form, submitButton };
}

function fillValid(controls: {
  name: HTMLInputElement;
  email: HTMLInputElement;
  subject: HTMLSelectElement;
  message: HTMLTextAreaElement;
}) {
  setValue(controls.name, 'Ada Lovelace');
  setValue(controls.email, 'ada@example.com');
  setValue(controls.subject, 'general');
  setValue(controls.message, 'Hello, this is a valid message.');
}

describe('ContactForm', () => {
  it('renders every field with an associated label, and nothing else beyond spec.md', () => {
    return createForm().then(({ root }) => {
      const expectations: Array<[string, string]> = [
        ['name', 'Your name'],
        ['email', 'Email address'],
        ['subject', "What's this about?"],
        ['message', 'Message'],
      ];
      for (const [id, text] of expectations) {
        const label = root.querySelector(`label[for="${id}"]`);
        expect(label?.textContent?.trim()).toBe(text);
        expect(root.querySelector(`#${id}`)).toBeTruthy();
      }
      expect(root.querySelectorAll('input, select, textarea').length).toBe(4);
    });
  });

  it('offers the subject options in order, starting unselected', () => {
    return createForm().then(({ subject }) => {
      expect(subject.value).toBe('');
      const optionValues = Array.from(subject.options).map((option) => option.value);
      expect(optionValues).toEqual(['', 'general', 'support', 'other']);
      const optionLabels = Array.from(subject.options).map((option) => option.textContent);
      expect(optionLabels).toEqual([
        'Choose one',
        'General enquiry',
        'Support',
        'Something else',
      ]);
    });
  });

  it('shows no errors before any interaction', () => {
    return createForm().then(({ root }) => {
      expect(root.querySelectorAll('[role="alert"]').length).toBe(0);
    });
  });

  it('shows an accessible error on blur for an invalid value', () => {
    return createForm().then(({ fixture, root, name }) => {
      setValue(name, 'A');
      blur(name);
      fixture.detectChanges();

      expect(name.getAttribute('aria-invalid')).toBe('true');
      const describedBy = name.getAttribute('aria-describedby');
      expect(describedBy).toBe('name-error');

      const errorEl = root.querySelector(`#${describedBy}`);
      expect(errorEl?.getAttribute('role')).toBe('alert');
      expect(errorEl?.textContent).toBe('Enter your name (2–80 characters).');
    });
  });

  it('does not show an error before blur, even for an invalid value', () => {
    return createForm().then(({ fixture, root, name }) => {
      setValue(name, 'A');
      fixture.detectChanges();

      expect(name.getAttribute('aria-invalid')).toBeNull();
      expect(root.querySelectorAll('[role="alert"]').length).toBe(0);
    });
  });

  it('revalidates as the user types once an error has been shown, clearing it when valid', () => {
    return createForm().then(({ fixture, root, name }) => {
      setValue(name, 'A');
      blur(name);
      fixture.detectChanges();
      expect(root.querySelectorAll('[role="alert"]').length).toBe(1);

      setValue(name, 'Ada');
      fixture.detectChanges();

      expect(root.querySelectorAll('[role="alert"]').length).toBe(0);
      expect(name.getAttribute('aria-invalid')).toBeNull();
    });
  });

  it('on submit with empty fields, shows every error and moves focus to the first invalid control', () => {
    return createForm().then(({ fixture, root, form, name }) => {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();

      expect(root.querySelectorAll('[role="alert"]').length).toBe(4);
      expect(document.activeElement).toBe(name);
    });
  });

  it('moves focus to the first invalid control that is not the first field', () => {
    return createForm().then(({ fixture, form, name, email, subject, message }) => {
      setValue(name, 'Ada Lovelace');
      setValue(email, 'not-an-email');
      setValue(subject, 'general');
      setValue(message, 'A perfectly fine message body.');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();

      expect(document.activeElement).toBe(email);
    });
  });

  it('submits without errors when every field is valid', () => {
    return createForm().then(({ fixture, root, form, name, email, subject, message }) => {
      fillValid({ name, email, subject, message });
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();

      expect(root.querySelectorAll('[role="alert"]').length).toBe(0);
    });
  });

  it('is completable using only keyboard-reachable, native form controls', () => {
    return createForm().then(({ root, submitButton }) => {
      const interactive = root.querySelectorAll('input, select, textarea, button');
      expect(interactive.length).toBe(5);
      for (const el of Array.from(interactive)) {
        expect(el.getAttribute('tabindex')).not.toBe('-1');
      }
      expect(submitButton.type).toBe('submit');
    });
  });
});
