import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import moment from 'moment';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-invoices4',
  templateUrl: './invoices4.component.html',
  styleUrls: ['./invoices4.component.css']
})
export class Invoices4Component implements OnInit {
  paidInvoices: any[] = [];
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
  alertType!: string;
  alertMessage!: string;
  showAlert!: boolean;
  formData: any;
  currentStep: number = 1; // Initialize currentStep as 1
  submittingForm: boolean = false;
  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;

      // fetch all the invoices and quotes and combine them
      this.fetchCombinedItems();
      this.fetchInvoices();
      this.loadPaidInvoices();
    } else {
      console.error('Token not found.');
    }

    this.initForm(); // Initialize the form on component initialization
  }

  toggleForms(form: string): void {
    this.currentForm = form;
  }

  fetchCombinedItems(): void {
    this.submittingForm = true;
  
    forkJoin([
      this.http.get<any[]>(`http://localhost:8080/user/${this.email}/payment-status/unpaid`).pipe(
        catchError(error => {
          console.error('Error fetching invoices:', error);
          return of([]); // Return an empty array if there's an error
        })
      ),
      this.http.get<any[]>('http://localhost:8080/user/displayAllQuote?email=' + this.email).pipe(
        catchError(error => {
          console.error('Error fetching quotes:', error);
          return of([]); // Return an empty array if there's an error
        })
      ),
      this.http.get<any[]>(`http://localhost:8080/user/${this.email}/payment-status/paid`).pipe(
        catchError(error => {
          console.error('Error fetching paid invoices:', error);
          return of([]); // Return an empty array if there's an error
        })
      )
    ]).subscribe(
      ([invoices, quotes, paidInvoices]) => {
        // Combine invoices, quotes, and paid invoices into one array
        this.combinedItems = [...invoices, ...quotes, ...paidInvoices];
        // Sort the combined array by date in descending order
        this.combinedItems.sort((a, b) => {
          const dateA = new Date(this.convertToDate(a.date));
          const dateB = new Date(this.convertToDate(b.date));
          return dateB.getTime() - dateA.getTime();
        });
  
        this.submittingForm = false; // Set submittingForm to false after data is fetched
      },
      error => {
        console.error('Error fetching data:', error);
        // Handle errors, such as displaying an error message to the user
        this.submittingForm = false; // Set submittingForm to false in case of error
      }
    );
  }
  

  convertToDate(dateString: string): string {
    const [month, day, year] = dateString.split('/');
    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }

  performSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.fetchCombinedItems();
    } else {
      this.combinedItems = this.combinedItems.filter(item =>
        (item.invoiceNo && item.invoiceNo.toString().includes(this.searchQuery)) ||
        (item.qouteNo && item.qouteNo.toString().includes(this.searchQuery)) ||
        item.date.includes(this.searchQuery) ||
        item.totalAmount?.toString().includes(this.searchQuery)
      );
    }
  }

  dateRange: string = '';
  amountRange: string = '';
  selectAmountRange(range: string): void {
    this.amountRange = range; // Set the selected amount range
  }

  
  applyFilter(): void {
    this.submittingForm = true; // Set submittingForm to true to show loading indicator
  
    const amountRangeParts = this.amountRange.split(' - ');
    const startAmount = parseFloat(amountRangeParts[0]);
    const endAmount = parseFloat(amountRangeParts[1]);
  
    const paymentStatusPaid = 'Paid'; // Set the payment status to "paid" for paid invoices
    const urlPaid = `http://localhost:8081/user/${this.email}/payment-status/${paymentStatusPaid}`;
  
    this.http.get<any[]>(urlPaid).subscribe(
      paidInvoices => {
        // Filter the paidInvoices array to include only invoices that fall within the specified date and amount range
        this.paidInvoices = paidInvoices.filter(item => {
          const itemDate = moment(item.date, 'M/D/YYYY');
          const isDateInRange = !this.startDate || !this.endDate || 
            (itemDate.isSameOrAfter(this.startDate) && itemDate.isSameOrBefore(this.endDate));
  
          const isAmountInRange = isNaN(startAmount) || isNaN(endAmount) || 
            (item.totalAmount >= startAmount && item.totalAmount <= endAmount);
  
          return isDateInRange && isAmountInRange;
        });
  
        // Fetch unpaid invoices
        const paymentStatusUnpaid = 'Unpaid'; // Set the payment status to "unpaid" for unpaid invoices
        const urlUnpaid = `http://localhost:8081/user/${this.email}/payment-status/${paymentStatusUnpaid}`;
  
        this.http.get<any[]>(urlUnpaid).subscribe(
          unpaidInvoices => {
            // Fetch quotes
            this.http.get<any[]>('http://localhost:8081/user/displayAllQuote?email=' + this.email)
              .subscribe(
                quotes => {
                  // Combine paid, unpaid invoices, and quotes into one array
                  const combinedItems = [...this.paidInvoices, ...unpaidInvoices, ...quotes];
  
                  // Sort the combinedItems array by date in descending order
                  combinedItems.sort((a, b) => moment(b.date, 'M/D/YYYY').diff(moment(a.date, 'M/D/YYYY')));
  
                  // Filter combinedItems based on date and amount range
                  this.combinedItems = combinedItems.filter(item => {
                    const itemDate = moment(item.date, 'M/D/YYYY');
                    const isDateInRange = !this.startDate || !this.endDate || 
                      (itemDate.isSameOrAfter(this.startDate) && itemDate.isSameOrBefore(this.endDate));
  
                    const isAmountInRange = isNaN(startAmount) || isNaN(endAmount) || 
                      (item.totalAmount >= startAmount && item.totalAmount <= endAmount);
  
                    return isDateInRange && isAmountInRange;
                  });
  
                  // Optionally, filter invoices separately if needed
                  if (this.startDate && this.endDate && !isNaN(startAmount) && !isNaN(endAmount)) {
                    this.invoices = unpaidInvoices.filter(invoiceItem => {
                      const invoiceItemDate = moment(invoiceItem.date, 'M/D/YYYY');
                      const isInvoiceDateInRange = invoiceItemDate.isSameOrAfter(this.startDate) && invoiceItemDate.isSameOrBefore(this.endDate);
                      const isInvoiceAmountInRange = invoiceItem.totalAmount >= startAmount && invoiceItem.totalAmount <= endAmount;
                      return isInvoiceDateInRange && isInvoiceAmountInRange;
                    });
                  }
  
                  this.submittingForm = false; // Set submittingForm to false after data is fetched and processed
                  this.toggleForms('form1');
                },
                error => {
                  console.error('Error fetching quotes:', error);
                  this.submittingForm = false; // Set submittingForm to false in case of error
                }
              );
          },
          error => {
            console.error('Error fetching unpaid invoices:', error);
            this.submittingForm = false; // Set submittingForm to false in case of error
          }
        );
      },
      error => {
        console.error('Error fetching paid invoices:', error);
        this.submittingForm = false; // Set submittingForm to false in case of error
      }
    );
  }
  
  
  
  

  fetchInvoices() {
    this.http.get<any[]>(`http://localhost:8081/user/${this.email}/payment-status/unpaid`)
      .subscribe(
        invoices => {
          invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.invoices = invoices || [];
       
        },
        error => {
          console.error('Error fetching invoices:', error);
        }
      );
  }
loadPaidInvoices() {
  const paymentStatus = 'Paid'; // Set the payment status to "paid"
  const url = `http://localhost:8081/user/${this.email}/payment-status/${paymentStatus}`;

  this.http.get<any[]>(url).subscribe(
    invoices => {
      this.paidInvoices = invoices;
      // Sort the paidInvoices array by date in descending order
      this.paidInvoices.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Sort in descending order
      });
    },
    error => {
      console.error('Error fetching paid invoices:', error);
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
      }
    );
  }

  getQuoteDetails(quoteNo: number): void {
    const apiUrl = `http://localhost:8081/user/quote/${quoteNo}`;
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

  initForm(): void {
    this.formData = this.formBuilder.group({
      client: this.formBuilder.group({
        f_name: new FormControl('', Validators.required),
        l_name: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phoneNo: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')])
      }),
      clientAddress: this.formBuilder.group({
        streetNo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
        streetName: new FormControl('', Validators.required),
        town: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        postalCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
      }),
      invoice: this.formBuilder.group({
        totalAmount: ['0', Validators.required]
      }),
      quote: this.formBuilder.group({
        totalAmount: ['0', Validators.required]
      }),
      items: this.formBuilder.array([
        this.createItem()
      ]),
    });
  }

  get items(): FormArray {
    return this.formData.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      desc: new FormControl('', Validators.required),
      price: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      qty: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  nextStep(): void {
    this.currentStep++;
  }

  setCurrentStep(step: number): void {
    this.currentStep = step;
  }

  

  onSubmit(quoteNo: number): void {
    if (isNaN(quoteNo) || quoteNo <= 0) {
      console.error('Invalid quoteNo.');
      return;
    }

    this.submittingForm = true;
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.extractEmailFromToken(token);
      const backendUrl = `http://localhost:8081/user/quotes/${quoteNo}/update?email=${email}`;
      this.http.post<any>(backendUrl, this.formData.value).subscribe(
        (response: any) => {
          console.log('Invoice or Quote submitted successfully:', response);
          this.showAlertMessage('success', 'Invoice or Quote submitted successfully:');

          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
        (error: any) => {
          console.error('Error submitting form data:', error);
        }
      ).add(() => {
        this.submittingForm = false;
      });
    } else {
      console.error('Token not found.');
    }
  }

  extractEmailFromToken(token: string): string {
    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      return decodedPayload.email;
    } else {
      console.error('Token not found.');
      return '';
    }
  }

  showAlertMessage(type: string, message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 7000); // Adjusted the timeout to 7 seconds
  }
}
