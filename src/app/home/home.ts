import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactForm } from '../contact-form/contact-form';

interface GalleryImage {
  readonly src: string;
  readonly altKey: string;
  readonly width: number;
  readonly height: number;
}

// Served from public/gallery/ (spec.md §6): same-origin, with intrinsic size declared up front.
const GALLERY_IMAGES: readonly GalleryImage[] = [
  { src: 'gallery/dawn.svg', altKey: 'gallery.images.dawn', width: 640, height: 400 },
  { src: 'gallery/noon.svg', altKey: 'gallery.images.noon', width: 640, height: 400 },
  { src: 'gallery/dusk.svg', altKey: 'gallery.images.dusk', width: 640, height: 400 },
];

@Component({
  selector: 'app-home',
  imports: [ContactForm, TranslocoPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly galleryImages = GALLERY_IMAGES;
}
