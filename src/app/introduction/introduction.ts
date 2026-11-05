import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The introduction above the form (specs/2026-11-04-introduction/): the Hero,
 * with the Bookings link, the logo as the page's heading and the torso photo.
 * Unstyled until phase 7.
 */
@Component({
  selector: 'app-introduction',
  imports: [RouterLink],
  templateUrl: './introduction.html',
})
export class Introduction {}
