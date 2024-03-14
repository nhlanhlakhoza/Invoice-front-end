import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Quote } from '../quote';
import moment from 'moment';

@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css']
})
export class QuotationsComponent implements OnInit {
  currentForm: string = 'form1';
  searchQuery: string = '';
  quotes: Quote[] = [];
  email: string = ''; // Assuming you'll get the email from somewhere
  startDate: moment.Moment | null = null;
  endDate: moment.Moment | null = null;
  amountRange: string = '';
  quoteDetails: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;

      // Fetch all the quotes
      this.fetchAllQuotes();
    } else {
      console.error('Token not found.');
    }
  }

  fetchAllQuotes(): void {
    this.http.get<Quote[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email)
      .subscribe(
        quotes => {
          // Sort quotes array in descending order by date
          this.quotes = quotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
        error => {
          console.error('Error fetching quotes:', error);
        }
      );
  }
  
  performSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.fetchAllQuotes();
    } else {
      this.quotes = this.quotes.filter(quote =>
        (quote.quoteNo && quote.quoteNo.toString().includes(this.searchQuery)) ||
        quote.date.includes(this.searchQuery) ||
        (quote.totalAmount && quote.totalAmount.toString().includes(this.searchQuery)) ||
        (quote.invoiceNo && quote.invoiceNo.toString().includes(this.searchQuery))
      );
    }
  }
  

  applyFilter(): void {
    const amountRangeParts = this.amountRange.split(' - ');
    const startAmount = parseFloat(amountRangeParts[0]);
    const endAmount = parseFloat(amountRangeParts[1]);
  
    // Fetch quotes
    this.http.get<any[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email)
      .subscribe(
        quotes => {
          // Filter quotes based on date range and amount range
          this.quotes = quotes.filter(quote => {
            const quoteDate = moment(quote.date, 'M/D/YYYY');
            const isDateInRange = !this.startDate || !this.endDate || 
                                  (quoteDate.isSameOrAfter(this.startDate) && quoteDate.isSameOrBefore(this.endDate));
            const isAmountInRange = isNaN(startAmount) || isNaN(endAmount) || 
                                    (quote.totalAmount >= startAmount && quote.totalAmount <= endAmount);
            return isDateInRange && isAmountInRange;
          });
  
          // After applying the filter, navigate back to form1
          this.toggleForms('form1');
        },
        error => {
          console.error('Error fetching quotes:', error);
        }
      );
  }
  

  toggleForms(form: string): void {
    this.currentForm = form;
  }

  getQuoteDetails(quoteNo: number): void {
    const apiUrl = `http://localhost:8081/user/quote/${quoteNo}`; // Use the passed quoteNo parameter
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        console.log('Quote details:', response);
        this.quoteDetails = response;
        this.toggleForms('form5'); 
      },
      (error) => {
        console.error('Error fetching quote details:', error);
      }
    );
  }
  
}
