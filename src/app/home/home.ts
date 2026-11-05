import { Component } from '@angular/core';
import { ContactForm } from '../contact-form/contact-form';
import { Introduction } from '../introduction/introduction';

@Component({
  selector: 'app-home',
  imports: [Introduction, ContactForm],
  templateUrl: './home.html',
})
export class Home {}
