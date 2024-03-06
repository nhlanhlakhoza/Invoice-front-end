import { Component } from '@angular/core';

@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.css'
})

  export class QuotationsComponent{
  
    currentForm: string = 'form1';
  
  toggleForms(form: string) {
    this.currentForm = form;
  }
  
  }

