import { TestBed } from '@angular/core/testing';
import { Video } from './video';

/**
 * jsdom implements neither playback, nor IntersectionObserver, nor matchMedia
 * (specs/2026-11-05-video/requirements.md, decision 9). These fakes stand in
 * for them: a video that plays and pauses with its events, an observer the
 * test moves into view by hand, and a reduced-motion preference to set.
 */
class FakeObserver {
  static readonly instances: FakeObserver[] = [];

  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(): void {
    // Not used by the component.
  }

  disconnect(): void {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Reports every observed element as `isIntersecting`. */
  report(isIntersecting: boolean): void {
    const entries = this.observed.map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

let paused: boolean;
let refusePlay: boolean;
let prefersReducedMotion: boolean;

beforeEach(() => {
  paused = true;
  refusePlay = false;
  prefersReducedMotion = false;
  FakeObserver.instances.length = 0;

  vi.stubGlobal('IntersectionObserver', FakeObserver);
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    matches: query.includes('prefers-reduced-motion: reduce') && prefersReducedMotion,
  }));

  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(() => paused);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    if (refusePlay) {
      return Promise.reject(new DOMException('Not allowed', 'NotAllowedError'));
    }
    paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused = true;
    this.dispatchEvent(new Event('pause'));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function createVideo() {
  await TestBed.configureTestingModule({ imports: [Video] }).compileComponents();
  const fixture = TestBed.createComponent(Video);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    video: root.querySelector(':scope > video') as HTMLVideoElement,
    button: root.querySelector(':scope > button') as HTMLButtonElement,
  };
}

function observer(): FakeObserver {
  expect(FakeObserver.instances.length).toBe(1);
  return FakeObserver.instances[0];
}

describe('Video', () => {
  describe('markup', () => {
    it('is a video, then its button', async () => {
      const { fixture } = await createVideo();
      const root = fixture.nativeElement as HTMLElement;

      expect([...root.children].map((child) => child.tagName)).toEqual(['VIDEO', 'BUTTON']);
      expect(root.querySelector('[id]')).toBeNull();
    });

    it('plays muted, in a loop and inline, and loads only its poster until it plays', async () => {
      const { video } = await createVideo();

      expect(video.hasAttribute('muted')).toBe(true);
      expect(video.hasAttribute('loop')).toBe(true);
      expect(video.hasAttribute('playsinline')).toBe(true);
      expect(video.getAttribute('preload')).toBe('none');
      expect(video.getAttribute('poster')).toBe('web/wavebuto-video-poster.webp');
      expect(video.getAttribute('width')).toBe('1280');
      expect(video.getAttribute('height')).toBe('720');
    });

    it('neither starts on its own before hydration nor shows the browser controls', async () => {
      const { video } = await createVideo();

      expect(video.hasAttribute('autoplay')).toBe(false);
      expect(video.hasAttribute('controls')).toBe(false);
    });

    it('names what it shows', async () => {
      const { video } = await createVideo();

      expect(video.getAttribute('aria-label')).toBe('Black line tattoo drawn along a back');
    });

    it('offers the WebM with its AV1 codec first, then the MP4, both same-origin', async () => {
      const { video } = await createVideo();
      const sources = [...video.querySelectorAll(':scope > source')].map((source) => ({
        src: source.getAttribute('src'),
        type: source.getAttribute('type'),
      }));

      expect(sources).toEqual([
        { src: 'web/wavebuto-video.webm', type: 'video/webm; codecs="av01.0.05M.08"' },
        { src: 'web/wavebuto-video.mp4', type: 'video/mp4; codecs="avc1.640028"' },
      ]);
    });

    it('has a button that is a button, not a submit', async () => {
      const { button } = await createVideo();

      expect(button.getAttribute('type')).toBe('button');
    });
  });

  describe('playback', () => {
    it('waits, paused, until half of it is in view', async () => {
      const { video, button } = await createVideo();

      expect(observer().observed).toEqual([video]);
      expect(observer().options?.threshold).toBe(0.5);
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
      expect(button.textContent?.trim()).toBe('Play video');
    });

    it('does not start while it is out of view', async () => {
      await createVideo();

      observer().report(false);

      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
      expect(observer().disconnected).toBe(false);
    });

    it('starts, muted, the first time it comes into view, and only that time', async () => {
      const { fixture, video, button } = await createVideo();

      observer().report(true);
      await fixture.whenStable();

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
      expect(video.muted).toBe(true);
      expect(observer().disconnected).toBe(true);
      expect(button.textContent?.trim()).toBe('Pause video');
    });

    it('does not start on its own when the visitor prefers reduced motion', async () => {
      prefersReducedMotion = true;
      const { button } = await createVideo();

      expect(FakeObserver.instances).toEqual([]);
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
      expect(button.textContent?.trim()).toBe('Play video');
    });

    it('stays paused, offering Play, when the browser refuses to play', async () => {
      refusePlay = true;
      const { fixture, button } = await createVideo();

      observer().report(true);
      await fixture.whenStable();

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
      expect(button.textContent?.trim()).toBe('Play video');
    });

    it('stops watching for the view when it is destroyed', async () => {
      const { fixture } = await createVideo();

      fixture.destroy();

      expect(observer().disconnected).toBe(true);
    });
  });

  describe('button', () => {
    it('pauses the playing video, then plays it again', async () => {
      const { fixture, button } = await createVideo();
      observer().report(true);
      await fixture.whenStable();

      button.click();
      await fixture.whenStable();

      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
      expect(button.textContent?.trim()).toBe('Play video');

      button.click();
      await fixture.whenStable();

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
      expect(button.textContent?.trim()).toBe('Pause video');
    });

    it('plays the video under reduced motion when the visitor asks for it', async () => {
      prefersReducedMotion = true;
      const { fixture, video, button } = await createVideo();

      button.click();
      await fixture.whenStable();

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
      expect(video.muted).toBe(true);
      expect(button.textContent?.trim()).toBe('Pause video');
    });
  });
});
