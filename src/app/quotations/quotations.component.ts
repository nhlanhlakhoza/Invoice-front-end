import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Quote } from '../quote'; // Adjust the path as per your project structure
import moment from 'moment';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
  formData!: FormGroup; // Change to FormGroup
  currentStep: any;
  alertType!: string;
  alertMessage!: string;
  showAlert!: boolean;
  submittingForm: boolean = false;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;

      // Fetch all the quotes
      this.fetchAllQuotes();
      this.initForm(); // Initialize the form
    } else {
      console.error('Token not found.');
    }
  }

  fetchAllQuotes(): void {
    this.http.get<Quote[]>('http://localhost:8080/user/displayAllQuote?email=' + this.email)
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
    this.http.get<any[]>('http://localhost:8080/user/displayAllQuote?email=' + this.email)
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
    const apiUrl = `http://localhost:8080/user/quote/${quoteNo}`;
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
    this.submittingForm = true;
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.extractEmailFromToken(token);
      const backendUrl = `http://localhost:8080/user/quotes/${quoteNo}/update?email=${email}`;
      this.http.post<any>(backendUrl, this.formData.value).subscribe(
        (response: any) => {
          console.log('Quotation updated successfully', response);
          this.showAlertMessage('success', 'Quotation updated successfully');
          setTimeout(() => {
              window.location.reload();
          }, 3000);
        },
        (error: any) => {
          console.error('Error submitting form data:', error);
          console.log(backendUrl);
          console.log(email);
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
    }, 7000);
  }
}
