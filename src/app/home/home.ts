import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactForm } from '../contact-form/contact-form';

interface GalleryVideo {
  readonly src: string;
  readonly labelKey: string;
  readonly width: number;
  readonly height: number;
}

// Design experiment: vertical clips served from public/, same-origin, with intrinsic size declared up front.
const GALLERY_VIDEOS: readonly GalleryVideo[] = [
  { src: 'video-1.mp4', labelKey: 'gallery.videos.one', width: 720, height: 1280 },
  { src: 'video-2.mp4', labelKey: 'gallery.videos.two', width: 360, height: 640 },
  { src: 'video-3.mp4', labelKey: 'gallery.videos.three', width: 720, height: 1280 },
];

@Component({
  selector: 'app-home',
  imports: [ContactForm, TranslocoPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly galleryVideos = GALLERY_VIDEOS;
}
