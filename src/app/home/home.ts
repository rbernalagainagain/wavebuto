import { Component } from '@angular/core';
import { ContactForm } from '../contact-form/contact-form';
import { Introduction } from '../introduction/introduction';
import { Video } from '../video/video';

@Component({
  selector: 'app-home',
  imports: [Introduction, Video, ContactForm],
  templateUrl: './home.html',
})
export class Home {}
