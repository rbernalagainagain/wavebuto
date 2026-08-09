import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Header and footer are static (spec.md §6): neither reads application state.
  protected readonly siteName = 'Wavebuto';
  protected readonly year = new Date().getFullYear();
}
