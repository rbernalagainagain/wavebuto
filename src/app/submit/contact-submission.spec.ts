import { submitContactForm } from './contact-submission';
import type { ContactFormValues } from '../validation';

const values: ContactFormValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'general',
  message: 'Hello, this is a valid message.',
};

function fakeResponse(ok: boolean): Response {
  return { ok } as Response;
}

describe('submitContactForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the four values as JSON to /api/contact, nothing else', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(fakeResponse(true));
    vi.stubGlobal('fetch', fetchSpy);

    await submitContactForm(values);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(values);
  });

  it('reports success on a 2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(true)));

    const result = await submitContactForm(values);

    expect(result).toEqual({ status: 'success' });
  });

  it('reports failure on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(false)));

    const result = await submitContactForm(values);

    expect(result).toEqual({ status: 'failure' });
  });

  it('reports failure on a network error, without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(submitContactForm(values)).resolves.toEqual({ status: 'failure' });
  });
});
