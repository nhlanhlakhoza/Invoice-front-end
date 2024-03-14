import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment from 'moment';
import { catchError, forkJoin, of } from 'rxjs';

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
  invoiceDetails: any;
  quoteDetails: any;

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

  fetchCombinedItems(): void {
    forkJoin([
      this.http.get<any[]>('http://localhost:8081/user/displayAllInvoices?email=' + this.email).pipe(
        catchError(error => {
          console.error('Error fetching invoices:', error);
          return of([]); // Return an empty array if there's an error
        })
      ),
      this.http.get<any[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email).pipe(
        catchError(error => {
          console.error('Error fetching quotes:', error);
          return of([]); // Return an empty array if there's an error
        })
      )
    ]).subscribe(
      ([invoices, quotes]) => {
        // Combine invoices and quotes into one array
        this.combinedItems = [...invoices, ...quotes];
        // Sort the combined array by date in descending order
        this.combinedItems.sort((a, b) => {
          const dateA = new Date(this.convertToDate(a.date));
          const dateB = new Date(this.convertToDate(b.date));
          return dateB.getTime() - dateA.getTime();
        });
      },
      error => {
        console.error('Error fetching invoices or quotes:', error);
        // Handle errors, such as displaying an error message to the user
      }
    );
  }
  
  convertToDate(dateString: string): string {
    const [month, day, year] = dateString.split('/');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
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
      (item.invoiceNo && item.invoiceNo.toString().includes(this.searchQuery)) || // Search by invoiceId for invoices
      (item.qouteNo && item.qouteNo.toString().includes(this.searchQuery)) || // Search by id for quotes
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

              // Sort combinedItems in descending order by date
              combinedItems.sort((a, b) => moment(b.date, 'M/D/YYYY').diff(moment(a.date, 'M/D/YYYY')));

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
        // Sort invoices by date in descending order
        invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.invoices = invoices || [];
      },
      error => {
        console.error('Error fetching invoices:', error);
      }
    );
}

getInvoiceDetails(invoiceNo: number): void {
  const apiUrl = `http://localhost:8081/user/invoice/${invoiceNo}`;
  this.http.get<any>(apiUrl).subscribe(
    (response) => {

      console.log('Invoice details:', response);
      this.invoiceDetails = response;
      this.toggleForms('form5'); 
    },
    (error) => {
      console.error('Error fetching invoice details:', error);
      // Handle error, display error message to the user, etc.
    }
  );
}
getQuoteDetails(quoteNo: number): void {
  const apiUrl = `http://localhost:8081/user/quote/${quoteNo}`; // Use the passed quoteNo parameter
  this.http.get<any>(apiUrl).subscribe(
    (response) => {
      console.log('Quote details:', response);
      this.quoteDetails = response;
      this.toggleForms('form6'); 
    },
    (error) => {
      console.error('Error fetching quote details:', error);
    }
  );
}
showButtons: boolean = true;

toggleButtons(item: any): void {
  this.showButtons = !this.showButtons;
}
}



