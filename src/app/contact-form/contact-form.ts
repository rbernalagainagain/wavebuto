import { Component, signal } from '@angular/core';
import {
  type FieldTree,
  form,
  FormField,
  FormRoot,
  StandardSchemaValidationError,
  validateStandardSchema,
} from '@angular/forms/signals';

import { createContactSchema } from '../validation/contact';
import { errorTextFor } from './error-text';
import { localDate } from './local-date';

/**
 * The form's values as the person types them (specs/2026-11-03-form/
 * requirements.md, decision 3): text, date and radio values as strings, `''`
 * when empty or nothing is chosen. The schema turns them into the validated
 * request; this model is never sent as it is.
 */
export interface ContactFormModel {
  name: string;
  instagram: string;
  email: string;
  location: string;
  placement: string;
  symmetry: string;
  dates: { from: string; to: string };
  flexibleDates: string;
  tattooHistory: string;
  notes: string;
  consent: boolean;
}

const EMPTY: ContactFormModel = {
  name: '',
  instagram: '',
  email: '',
  location: '',
  placement: '',
  symmetry: '',
  dates: { from: '', to: '' },
  flexibleDates: '',
  tattooHistory: '',
  notes: '',
  consent: false,
};

/** The appointment form of specs/form.md. Unstyled until phase 6. */
@Component({
  selector: 'app-contact-form',
  imports: [FormRoot, FormField],
  templateUrl: './contact-form.html',
})
export class ContactForm {
  protected readonly model = signal<ContactFormModel>(EMPTY);

  // Every rule is the schema's. It is built again each time the form
  // validates, so `today` is the browser's date at that moment, never the
  // build's (decision 4).
  protected readonly contactForm = form(
    this.model,
    (path) => {
      validateStandardSchema(path, () => createContactSchema(localDate(new Date())));
    },
    {
      // Trying to send marks every field as left, so each shows its error
      // (decision 7).
      submission: {
        // A valid form does nothing yet and makes no request: phase 10 sends it.
        action: async () => undefined,
        // The fields are declared in the order they appear on the page, so
        // the first field with an error is the first invalid one on screen.
        onInvalid: (root) => {
          const [first] = root().errorSummary();
          first?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  /**
   * The error to show under a field, in the page's language, or `null`. A
   * field shows its error only once the person has left it or tried to send,
   * and only one: the schema reports at most one code per field (decision 6).
   */
  protected errorOf<T>(field: FieldTree<T>): string | null {
    const state = field();
    if (!state.touched()) {
      return null;
    }
    const [error] = state.errors();
    if (!error) {
      return null;
    }
    return errorTextFor(
      error instanceof StandardSchemaValidationError ? error.issue.message : error.kind,
    );
  }
}
