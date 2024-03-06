import { Component, OnInit } from '@angular/core';
import { QuoteService } from '../quote.service';
import { Quote } from '../quote';

@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent  {
  quotes: Quote[] = [];
  email: string = 'nhlanhlakhoza05@gmail.com'; // Provide the email here

  constructor(private quoteService: QuoteService) { }

  ngOnInit(): void {
    this.getTop5Quotes();
  }

  getTop5Quotes(): void {
    this.quoteService.getQuotes(this.email)
      .subscribe((quotes): Quote[] => {
        return this.quotes = quotes;
      });
  }
}
