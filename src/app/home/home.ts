import {Component, input} from '@angular/core';
import { ContactForm } from '../contact-form/contact-form';

@Component({
  selector: 'app-home',
  imports: [ContactForm],
  templateUrl: './home.html',
})
export class Home {
}
