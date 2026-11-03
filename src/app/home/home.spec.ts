import { TestBed } from '@angular/core/testing';
import { Home } from './home';

async function createHome() {
  await TestBed.configureTestingModule({ imports: [Home] }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  it('shows a title and one sentence', async () => {
    const root = await createHome();

    const headings = root.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Wavebuto');

    const paragraphs = root.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0].textContent?.trim()).not.toBe('');
  });

  it('loads nothing', async () => {
    const root = await createHome();
    expect(root.querySelectorAll('[src], [href]').length).toBe(0);
  });
});
