import { localDate } from './local-date';

describe('localDate', () => {
  it('gives the date in the local time zone, as YYYY-MM-DD', () => {
    expect(localDate(new Date(2026, 10, 3, 12, 0))).toBe('2026-11-03');
  });

  it('keeps the local day at its first and last minute', () => {
    expect(localDate(new Date(2026, 10, 3, 0, 0))).toBe('2026-11-03');
    expect(localDate(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03');
  });

  it('pads the month and the day', () => {
    expect(localDate(new Date(2027, 0, 5))).toBe('2027-01-05');
  });
});
