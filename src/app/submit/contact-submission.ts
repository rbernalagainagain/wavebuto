import type { ContactFormValues } from '../validation';

export type SubmitResult = { readonly status: 'success' } | { readonly status: 'failure' };

const CONTACT_ENDPOINT = '/api/contact';

export async function submitContactForm(values: ContactFormValues): Promise<SubmitResult> {
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    return { status: response.ok ? 'success' : 'failure' };
  } catch {
    return { status: 'failure' };
  }
}
