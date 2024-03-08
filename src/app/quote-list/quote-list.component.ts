import { Component, OnInit } from '@angular/core';
import { QuoteService } from '../quote.service';
import { Quote } from '../quote';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent  {
  email: string = '';
  invoices: any[] = [];

  constructor(private http: HttpClient) {}

  fetchInvoices() {
    this.http.get<any[]>('http://localhost:8081/user/homeInvoices?email=' + this.email)
      .subscribe(
        invoices => {
          this.invoices = invoices || [];
        },
        error => {
          console.error('Error fetching invoices:', error);
        }
      );
  }
}
