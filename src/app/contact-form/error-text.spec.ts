import { CONTACT_ERROR_CODES } from '../validation/contact';
import { CONTACT_ERROR_TEXT } from './error-text';

describe('CONTACT_ERROR_TEXT', () => {
  it('has a text for every error code, and nothing else', () => {
    expect(Object.keys(CONTACT_ERROR_TEXT).sort()).toEqual([...CONTACT_ERROR_CODES].sort());
  });

  it('holds the English text of specs/form.md, "Errors"', () => {
    expect(CONTACT_ERROR_TEXT).toEqual({
      required: 'This field is required.',
      'too-long': 'This text is too long.',
      characters: 'This text contains characters that are not allowed.',
      email: 'Enter a valid email address, like name@example.com.',
      instagram: 'Enter your Instagram username: letters, numbers, dots and underscores, up to 30.',
      option: 'Choose one of the options.',
      date: 'Choose a valid date.',
      'date-past': 'Choose today or a later date.',
      'date-order': '"To" can\'t be before "From".',
      consent: 'Tick the box to send your request.',
    });
  });
});
