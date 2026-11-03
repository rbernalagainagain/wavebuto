import { Component, signal } from '@angular/core';
import { form, FormRoot, validateStandardSchema } from '@angular/forms/signals';

import { createContactSchema } from '../validation/contact';
import { CONTACT_ERROR_TEXT } from './error-text';
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

/** The appointment form of specs/form.md. Unstyled until phase 9. */
@Component({
  selector: 'app-contact-form',
  imports: [FormRoot],
  templateUrl: './contact-form.html',
})
export class ContactForm {
  protected readonly model = signal<ContactFormModel>(EMPTY);

  // Every rule is the schema's. It is built again each time the form
  // validates, so `today` is the browser's date at that moment, never the
  // build's (decision 4).
  protected readonly contactForm = form(this.model, (path) => {
    validateStandardSchema(path, () => createContactSchema(localDate(new Date())));
  });

  /** The text shown for each error code, in the page's language. */
  protected readonly errorText = CONTACT_ERROR_TEXT;
}
