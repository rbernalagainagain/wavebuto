import { Component, inject, LOCALE_ID } from '@angular/core';
import { RouterLink } from '@angular/router';

/** One segment of the manifesto: a city or a phrase. */
interface Segment {
  readonly text: string;
  readonly city: boolean;
}

/** A piece of the manifesto's visual version: a word, or a place where the line may break. */
interface Piece {
  readonly kind: 'city' | 'phrase' | 'break';
  readonly text: string;
}

/**
 * The manifesto, in the reading order of the Figma annotation
 * (specs/2026-11-04-introduction/requirements.md, decision 8). Both versions
 * are built from this list, so the copy is written once.
 */
const MANIFESTO: readonly Segment[] = [
  { text: $localize`:@@intro.manifesto.1:London`, city: true },
  { text: $localize`:@@intro.manifesto.2:Freehand structure`, city: false },
  { text: $localize`:@@intro.manifesto.3:Amsterdam`, city: true },
  { text: $localize`:@@intro.manifesto.4:Based on your anatomy`, city: false },
  { text: $localize`:@@intro.manifesto.5:Brazil`, city: true },
  { text: $localize`:@@intro.manifesto.6:To create a unique new skin`, city: false },
  { text: $localize`:@@intro.manifesto.7:Sydney`, city: true },
  { text: $localize`:@@intro.manifesto.8:Limited spots`, city: false },
  { text: $localize`:@@intro.manifesto.9:More to come`, city: false },
];

/** Every word in upper case, run together, with a break wherever a space was. */
function visualPieces(segments: readonly Segment[], locale: string): Piece[] {
  const pieces: Piece[] = [];
  for (const segment of segments) {
    for (const word of segment.text.split(/\s+/)) {
      if (pieces.length > 0) {
        pieces.push({ kind: 'break', text: '' });
      }
      pieces.push({
        kind: segment.city ? 'city' : 'phrase',
        text: word.toLocaleUpperCase(locale),
      });
    }
  }
  return pieces;
}

/** Each segment as written, ending in a full stop, as one paragraph. */
function readableText(segments: readonly Segment[]): string {
  return segments.map((segment) => `${segment.text}.`).join(' ');
}

/**
 * The introduction above the form (specs/2026-11-04-introduction/): the Hero,
 * with the Bookings link, the logo as the page's heading and the torso photo,
 * then the Manifiesto, with the face photo and the manifesto. Unstyled until
 * phase 6.
 */
@Component({
  selector: 'app-introduction',
  imports: [RouterLink],
  templateUrl: './introduction.html',
})
export class Introduction {
  private readonly locale = inject(LOCALE_ID);

  protected readonly visual = visualPieces(MANIFESTO, this.locale);
  protected readonly readable = readableText(MANIFESTO);
}
