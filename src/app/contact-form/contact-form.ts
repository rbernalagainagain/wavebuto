import { Component, ElementRef, afterRenderEffect, signal, viewChild } from '@angular/core';
import { FormField, form, submit, validateStandardSchema } from '@angular/forms/signals';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  SUBJECT_OPTIONS,
  contactFormSchema,
  type ContactFormInput,
  type FieldName,
} from '../validation';
import { submitContactForm } from '../submit';

type SubmitPhase = 'idle' | 'submitting' | 'success' | 'failure';

const FIELD_ORDER: readonly FieldName[] = ['name', 'email', 'subject', 'message'];

@Component({
  selector: 'app-contact-form',
  imports: [FormField, TranslocoPipe],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  protected readonly subjectOptions = SUBJECT_OPTIONS;

  private readonly model = signal<ContactFormInput>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Every rule comes from the one Zod schema (spec.md §3); the form restates none of them.
  protected readonly contactForm = form(this.model, (path) => {
    validateStandardSchema(path, contactFormSchema);
  });

  protected readonly submitPhase = signal<SubmitPhase>('idle');

  private readonly successMessage = viewChild<ElementRef<HTMLElement>>('successMessage');

  constructor() {
    afterRenderEffect(() => {
      if (this.submitPhase() === 'success') {
        this.successMessage()?.nativeElement.focus();
      }
    });
  }

  // Errors appear once a field is touched (on blur, or on submit) and then track the value as the
  // user types, so a message clears as soon as the input becomes valid (spec.md §4).
  protected showError(field: FieldName): boolean {
    const state = this.contactForm[field]();
    return state.touched() && state.invalid();
  }

  protected errorKey(field: FieldName): string {
    return this.contactForm[field]().errors()[0]?.message ?? '';
  }

  protected errorId(field: FieldName): string {
    return `${field}-error`;
  }

  protected onSubjectChange(value: string): void {
    // Browsers fire `input` on a select as well, but `change` is the event a select is defined by.
    this.contactForm.subject().value.set(value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitPhase() === 'submitting') {
      return;
    }

    void submit(this.contactForm, {
      action: async () => {
        // The schema's output is the payload: the four trimmed values, nothing else (spec.md §5).
        const values = contactFormSchema.parse(this.model());
        this.submitPhase.set('submitting');
        const result = await submitContactForm(values);
        this.submitPhase.set(result.status);
        return undefined;
      },
      onInvalid: () => this.focusFirstInvalid(),
    });
  }

  private focusFirstInvalid(): void {
    const first = FIELD_ORDER.find((field) => this.contactForm[field]().invalid());
    if (first) {
      this.contactForm[first]().focusBoundControl();
    }
  }
}
