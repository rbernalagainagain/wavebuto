import { Location, ViewportScroller } from '@angular/common';
import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, TranslocoPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Header and footer are static (spec.md §6): neither reads application state.
  protected readonly sections = ['home', 'gallery', 'contact'] as const;
  protected readonly year = new Date().getFullYear();

  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');

  constructor() {
    // The header sticks to the top of the screen, so an anchor link must stop
    // short of its section by the header's height or the heading lands beneath
    // it. The router scrolls with explicit coordinates, which ignore CSS
    // scroll-padding, so the offset is given to the scroller instead.
    inject(ViewportScroller).setOffset(() => [0, this.header().nativeElement.offsetHeight]);

    // The address bar always reads "/". The section links navigate with
    // skipLocationChange; a URL that arrives with a fragment (an old or copied
    // /#gallery link) has already been scrolled to by the browser, so once the
    // page is live the fragment is dropped from the address bar in place.
    const location = inject(Location);
    afterNextRender(() => {
      if (location.path(true).includes('#')) {
        location.replaceState('/');
      }
    });
  }
}
