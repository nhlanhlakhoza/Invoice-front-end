import { Component } from '@angular/core';

@Component({
  selector: 'app-invoices4',
  templateUrl: './invoices4.component.html',
  styleUrl: './invoices4.component.css'
})
export class Invoices4Component {

  currentForm: string = 'form1';

toggleForms(form: string) {
  this.currentForm = form;
}


}
