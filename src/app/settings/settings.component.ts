import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface Notification {
  id: number;
  message: string;
  sentAt: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  newNotificationAdded: boolean = false;
  changeProfileForm: FormGroup;
  currentForm: string = 'form1';
  transformedMessage: string = '';
  invoiceNumber!: number;
  invoiceDetails: any;
  errorMessage: string = '';
  quoteNumber!: number;
  quoteDetails: any;
  email: string = ''; // Initialize with the default email
  notifications: Notification[] = [];
  apiUrl: string = 'http://localhost:8080/user/notifications'; // Update with your API endpoint URL

  // Additional properties
  formData!: FormGroup;
  alertType: string = '';
  alertMessage: string = '';
  showAlert: boolean = false;
  isNewNotification: boolean = false;
  currentStep: number = 0;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder) {
    this.changeProfileForm = this.formBuilder.group({
      id: new FormControl('0'),
      fullName: new FormControl('', Validators.required),
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      phone_number: new FormControl('', [Validators.required, this.mobileNumberValidator()]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      confirm_password: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;
      this.loadNotifications();
      this.getInvoiceDetails();
      this.initForm();
    } else {
      console.error('Token not found.');
    }
  }

  toggleForms(form: string) {
    this.currentForm = form;
  }

  //Change profile Information
  get change() { return this.changeProfileForm.controls; }

  navigateToDestination() {
    this.router.navigate(['/settings']);
  }

  navigateToProfile() {
    this.router.navigate(['/changePasswordSetting']);
  }

  mobileNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (isNaN(value)) {
        return { 'notANumber': { value: value } };
      }

      const mobileNumberRegex = /^[0-9]{10}$/; // Changed the regex to match 10 digits
      const valid = mobileNumberRegex.test(value);
      return valid ? null : { 'invalidMobileNumber': { value: value } };
    };
  }

  loadNotifications() {
    const url = `${this.apiUrl}?email=${this.email}`;
    this.http.get<Notification[]>(url)
      .pipe(
        catchError((error: any) => {
          console.error('Error fetching notifications:', error);
          return [];
        })
      )
      .subscribe((notifications: Notification[]) => {
        this.notifications = notifications.reverse(); // Display notifications in descending order
      });
  }

  addNewNotification(newNotification: Notification) {
    this.notifications.unshift(newNotification);
    this.isNewNotification = true;

    // Reset after 5 seconds
    setTimeout(() => {
      this.isNewNotification = false;
    }, 5000);
  }

  dismissNotification() {
    this.isNewNotification = false;
  }

  extractAndTransformMessage(notification: Notification): void {
    const parts: string[] = notification.message.split('#');
    if (parts.length > 1) {
      const numberPart: string = parts[1].split(' ')[0];
      const extractedNumber: number = parseInt(numberPart);
      if (!isNaN(extractedNumber)) {
        if (notification.message.includes('Invoice')) {
          this.invoiceNumber = extractedNumber;
          this.transformedMessage = `Invoice number: ${this.invoiceNumber}`;
          this.getInvoiceDetails();
          this.toggleForms('form5'); // Toggle to display invoice details
        } else if (notification.message.includes('Quote')) {
          this.quoteNumber = extractedNumber;
          this.transformedMessage = `Quote number: ${this.quoteNumber}`;
          this.getQuoteDetails();
          this.toggleForms('form5'); // Toggle to display quote details
        }
      }
    } else {
      this.transformedMessage = 'Invalid notification message';
    }
  }

  getInvoiceDetails(): void {
    const apiUrl = `http://localhost:8080/user/invoice/${this.invoiceNumber}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        console.log('Invoice details:', response);
        this.invoiceDetails = response;
      },
      (error) => {
        console.error('Error fetching invoice details:', error);
        this.errorMessage = 'Failed to fetch invoice details';
      }
    );
  }

  getQuoteDetails(): void {
    const apiUrl = `http://localhost:8080/user/quote/${this.quoteNumber}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        console.log('Quote details:', response);
        this.quoteDetails = response;
      },
      (error) => {
        console.error('Error fetching quote details:', error);
        this.errorMessage = 'Failed to fetch quote details';
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

   // Flag to track form submission
   submittingForm: boolean = false;
  onSubmit(): void {

    this.submittingForm = true; // Set submittingForm flag to true
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.extractEmailFromToken(token);
      const backendUrl = `http://localhost:8080/user/quotes/${this.quoteNumber}/update?email=${email}`;
      this.http.post<any>(backendUrl, this.formData.value).subscribe(
        (response: any) => {
          console.log('Quotation updated successfully', response);
          this.showAlertMessage('success', 'Quotation updated successfully');

          setTimeout(() => {
           
              // Refresh the page after 3 seconds
              window.location.reload();
            
          }, 3000);
        },
        (error: any) => {
          console.error('Error submitting form data:', error);
          console.log(backendUrl);
          console.log(email);
        }
      ).add(() => {
          this.submittingForm = false; // Set submittingForm flag to false when request completes
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
