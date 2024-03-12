import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors,ValidatorFn } from '@angular/forms';
import { catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Notification {
  id: number;
  message: string;
  sentAt: string;
}


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent 
{
  newNotificationAdded: boolean = false;
  changeProfileForm: FormGroup = new FormGroup
  ({
    id: new FormControl('0'),
    fullName: new FormControl('', Validators.required),
    emailAddress: new FormControl('',  [Validators.required, Validators.email]),
    phone_number: new FormControl('',  [Validators.required, this.mobileNumberValidator() ]),
    password: new FormControl('',  [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    confirm_password: new FormControl('',  Validators.required)
});

  currentForm: string = 'form1';
 
  transformedMessage: string = '';
  invoiceNumber!: number;
  invoiceDetails: any;
  errorMessage: string = '';


  toggleForms(form: string) {
    this.currentForm = form;
  }

  //Change profile Information
get change (){return this.changeProfileForm.controls;}

  constructor(private router: Router,private http: HttpClient) { }

  navigateToDestination() {
      this.router.navigate(['/settings']);
  }

  navigateToProfile() {
    this.router.navigate(['/changePasswordSetting']);
}
  mobileNumberValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (isNaN(value)) {
        return { 'notANumber': { value: value } };
      }
     
      const mobileNumberRegex = /^[A-Z]{10}$/; // Change this regex based on your mobile number format
      const valid = mobileNumberRegex.test(value);
      return valid ? null : { 'invalidMobileNumber': { value: value } };
    };
  }


  notifications: Notification[] = [];
  email: string = ''; // Initialize with the default email
  apiUrl: string = 'http://localhost:8081/user/notifications'; // Update with your API endpoint URL

  

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;
    this.loadNotifications();
    this.getInvoiceDetails()
  }else {
    console.error('Token not found.');
  }
}

 // Load notifications from the server
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
  this.notifications.unshift(newNotification); // Add new notification to the beginning of the array
  this.newNotificationAdded = true;

  // Reset newNotificationAdded after a delay
  setTimeout(() => {
    this.newNotificationAdded = false;
  }, 5000); // Reset after 5 seconds
}
dismissNotification() {
  this.newNotificationAdded = false;
}





extractAndTransformMessage(notification: Notification): void {
  const parts: string[] = notification.message.split('#');
  if (parts.length > 1) {
    const numberPart: string = parts[1].split(' ')[0];
    this.invoiceNumber = parseInt(numberPart);
    if (!isNaN(this.invoiceNumber)) {
      this.transformedMessage = `Invoice number: ${this.invoiceNumber}`;
      this.getInvoiceDetails();
      this.toggleForms('form5'); // Toggle to display invoice details
    }
  } else {
    this.transformedMessage = 'Invalid notification message';
  }
}

getInvoiceDetails(): void {
  const apiUrl = `http://localhost:8081/user/invoice/${this.invoiceNumber}`;
  this.http.get<any>(apiUrl).subscribe(
    (response) => {
      console.log('Invoice details:', response);
      this.invoiceDetails = response;
    },
    (error) => {
      console.log(this.invoiceNumber);
      console.error('Error fetching invoice details:', error);
      this.errorMessage = 'Failed to fetch invoice details';
    }
  );
}

}
