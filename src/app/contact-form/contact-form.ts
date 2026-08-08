import { Component, ElementRef, signal, viewChild } from '@angular/core';
import {
  SUBJECT_OPTIONS,
  validateEmail,
  validateMessage,
  validateName,
  validateSubject,
  type ContactFormValues,
  type SubjectValue,
} from '../validation';

export type FieldName = keyof ContactFormValues;

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

type FormState = Record<FieldName, FieldState>;

const FIELD_ORDER: readonly FieldName[] = ['name', 'email', 'subject', 'message'];

const VALIDATORS: Record<FieldName, (value: string) => string | null> = {
  name: validateName,
  email: validateEmail,
  subject: validateSubject,
  message: validateMessage,
};

const SUBJECT_LABELS: Record<SubjectValue, string> = {
  general: 'General enquiry',
  support: 'Support',
  other: 'Something else',
};

function emptyFieldState(): FieldState {
  return { value: '', error: null, touched: false };
}

function initialFormState(): FormState {
  return {
    name: emptyFieldState(),
    email: emptyFieldState(),
    subject: emptyFieldState(),
    message: emptyFieldState(),
  };
}

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
})
export class ContactForm {
  protected readonly subjectOptions = SUBJECT_OPTIONS;
  protected readonly subjectLabels = SUBJECT_LABELS;

  protected readonly state = signal<FormState>(initialFormState());

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  private readonly subjectSelect = viewChild<ElementRef<HTMLSelectElement>>('subjectSelect');
  private readonly messageTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('messageTextarea');

  protected onInput(field: FieldName, value: string): void {
    this.state.update((current) => {
      const fieldState = current[field];
      const nextError = fieldState.touched ? VALIDATORS[field](value) : fieldState.error;
      return { ...current, [field]: { ...fieldState, value, error: nextError } };
    });
  }

  protected onBlur(field: FieldName): void {
    this.state.update((current) => {
      const fieldState = current[field];
      return {
        ...current,
        [field]: { ...fieldState, touched: true, error: VALIDATORS[field](fieldState.value) },
      };
    });
  }

  protected showError(field: FieldName): boolean {
    const fieldState = this.state()[field];
    return fieldState.touched && fieldState.error !== null;
  }

  protected errorId(field: FieldName): string {
    return `${field}-error`;
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const current = this.state();
    const next: FormState = { ...current };
    let firstInvalid: FieldName | null = null;

    for (const field of FIELD_ORDER) {
      const error = VALIDATORS[field](current[field].value);
      next[field] = { ...current[field], touched: true, error };
      if (error !== null && firstInvalid === null) {
        firstInvalid = field;
      }
    }

    this.state.set(next);

    if (firstInvalid !== null) {
      this.focusField(firstInvalid);
    }
  }

  private focusField(field: FieldName): void {
    const controls: Record<FieldName, ElementRef<HTMLElement> | undefined> = {
      name: this.nameInput(),
      email: this.emailInput(),
      subject: this.subjectSelect(),
      message: this.messageTextarea(),
    };
    controls[field]?.nativeElement.focus();
  }
}
