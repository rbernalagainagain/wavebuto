import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

/** How much of the video must be in view before it starts. */
const IN_VIEW = 0.5;

/**
 * Plays the video, muted. If the browser refuses, the video stays paused and
 * the button reads "Play video": that is the visible state, so there is
 * nothing else to report.
 */
function play(video: HTMLVideoElement): void {
  // The `muted` attribute only mutes an element the parser created; set the
  // property too, so browsers allow a muted video to play on its own.
  video.muted = true;
  video.play().catch(() => undefined);
}

/**
 * Starts the video the first time half of it is in view, and never on its own
 * when the visitor prefers reduced motion. Returns the observer to disconnect,
 * or nothing when the video is left for the visitor to start.
 */
function startWhenSeen(video: HTMLVideoElement): IntersectionObserver | undefined {
  if (typeof IntersectionObserver === 'undefined' || typeof matchMedia === 'undefined') {
    return undefined;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return undefined;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        play(video);
      }
    },
    { threshold: IN_VIEW },
  );
  observer.observe(video);
  return observer;
}

/**
 * The video of the artist's work, between the introduction and the form
 * (specs/2026-11-05-video/). It plays muted and in a loop from the first time
 * it is in view, and a button pauses and plays it (WCAG 2.2.2).
 */
@Component({
  selector: 'app-video',
  templateUrl: './video.html',
  styleUrl: './video.css',
})
export class Video {
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  protected readonly playing = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Browser only, after the first render: never during prerendering.
    afterNextRender(() => {
      const observer = startWhenSeen(this.video().nativeElement);
      if (observer) {
        destroyRef.onDestroy(() => observer.disconnect());
      }
    });
  }

  protected toggle(): void {
    const video = this.video().nativeElement;
    if (video.paused) {
      play(video);
    } else {
      video.pause();
    }
  }
}
