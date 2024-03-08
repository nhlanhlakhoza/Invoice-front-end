import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';

@Component({
  selector: 'app-invoices4',
  templateUrl: './invoices4.component.html',
  styleUrls: ['./invoices4.component.css']
})
export class Invoices4Component implements OnInit {

  currentForm: string = 'form1';
  email: string = '';
  combinedItems: any[] = [];
  searchQuery: string = '';
selectedAmountRange: any;
startDate: any;
endDate: any;
  invoices: any[] = [];
  totalInvoiceAmount: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;

      // fetch all the invoices and quotes and combine them
      this.fetchCombinedItems();
      this.fetchInvoices()
    } else {
      console.error('Token not found.');
    }
  }

  toggleForms(form: string) {
    this.currentForm = form;
  }

  fetchCombinedItems() {
    this.http.get<any[]>('http://localhost:8081/user/displayAllInvoices?email=' + this.email)
      .subscribe(
        invoices => {
          this.http.get<any[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email)
            .subscribe(
              quotes => {
                // Combine invoices and quotes into one array
                this.combinedItems = [...invoices, ...quotes];
                // Sort the combined array by date
                this.combinedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              },
              error => {
                console.error('Error fetching quotes:', error);
              }
            );
        },
        error => {
          console.error('Error fetching invoices:', error);
        }
      );
  }
 
 // Method to perform search/filtering
 performSearch(): void {
  // Check if the search query is empty
  if (this.searchQuery.trim() === '') {
    // If empty, reset the displayed items to the original combined items
    this.fetchCombinedItems();
  } else {
    // If not empty, filter combined items based on search query
    this.combinedItems = this.combinedItems.filter(item =>
      (item.invoiceId && item.invoiceId.toString().includes(this.searchQuery)) || // Search by invoiceId for invoices
      (item.id && item.id.toString().includes(this.searchQuery)) || // Search by id for quotes
      item.date.includes(this.searchQuery) || // Search by date for both
      item.totalAmount?.toString().includes(this.searchQuery) // Search by totalAmount for both
    );
  }
}

dateRange: string = '';
amountRange: string = '';

applyFilter(): void {
  // Convert amount range string to start and end amounts
  const amountRangeParts = this.amountRange.split(' - ');
  const startAmount = parseFloat(amountRangeParts[0]);
  const endAmount = parseFloat(amountRangeParts[1]);

  // Fetch invoices
  this.http.get<any[]>('http://localhost:8081/user/displayAllInvoices?email=' + this.email)
    .subscribe(
      invoices => {
        // Fetch quotes
        this.http.get<any[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email)
          .subscribe(
            quotes => {
              // Combine invoices and quotes
              const combinedItems = [...invoices, ...quotes];

              // Filter items based on date range and amount range
              this.combinedItems = combinedItems.filter(item => {
                // Convert item's date to a moment object
                const itemDate = moment(item.date, 'M/D/YYYY');

                // Check if item's date is within the range
                const isDateInRange = !this.startDate || !this.endDate || 
                  (itemDate.isSameOrAfter(this.startDate) && itemDate.isSameOrBefore(this.endDate));

                // Check if item's totalAmount is within the range
                const isAmountInRange = isNaN(startAmount) || isNaN(endAmount) || 
                  (item.totalAmount >= startAmount && item.totalAmount <= endAmount);

                // Keep the item only if both date and amount are within range
                return isDateInRange && isAmountInRange;
              });

              // Apply the same filtering logic to the invoices array
              if (this.startDate && this.endDate && !isNaN(startAmount) && !isNaN(endAmount)) {
                this.invoices = invoices.filter(invoiceItem => {
                  const invoiceItemDate = moment(invoiceItem.date, 'M/D/YYYY');

                  const isInvoiceDateInRange = invoiceItemDate.isSameOrAfter(this.startDate) && invoiceItemDate.isSameOrBefore(this.endDate);
  
                  const isInvoiceAmountInRange = invoiceItem.totalAmount >= startAmount && invoiceItem.totalAmount <= endAmount;
                  
                  return isInvoiceDateInRange && isInvoiceAmountInRange;

                  
                });
              }
               // After applying the filter, navigate back to form1
               this.toggleForms('form1');
            },

            
            error => {
              console.error('Error fetching quotes:', error);
            }
          );
      },
      error => {
        console.error('Error fetching invoices:', error);
      }
    );
}



fetchInvoices() {
  this.http.get<any[]>('http://localhost:8081/user/displayAllInvoices?email=' + this.email)
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



