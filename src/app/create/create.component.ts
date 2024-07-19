import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular';
import { Company } from '../company';
interface BusinessInfoResponse {
  id: number;
  companyName: string;
  streetNo: string;
  streetName: string;
  town: string;
  postalCode: number;
  taxNo: string;
  email: string;
  city: string;
}
interface FormData {
  client: {
    f_name: string;
    l_name: string;
    email: string;
    phoneNo: string;
  };
  clientAddress: {
    streetNo: string;
    streetName: string;
    town: string;
    city: string;
    postalCode: string;
  };
  invoice: {
    totalAmount: string;
  };
  quote: {
    totalAmount: string;
  };
  items: {
    desc: string;
    price: string;
    qty: string;
  }[];
  type: string;
  companyName:string;
}


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css', 'one.css', 'two.css', 'three.css']
})

//here
export class CreateComponent {

  
  formData!: FormGroup;
  currentStep: number = 1;
  activeMenuItem!: string;
  alertMessage!: string;
  alertType!: string;
  showAlert!: boolean;
  companyNames: string[] = [];
  selectedCompanyName: string = ''; // Initialize the property
  businessInfoList: Company[] = []; // Change the type to Company[]
  email: any;
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));
      this.email = decodedPayload.email;
    } else {
      console.error('Token not found.');
    }
    this.fetchBusinessInfo();
    this.formData = this.formBuilder.group({
      client: this.formBuilder.group({
        f_name: new FormControl('', Validators.required),
        l_name: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phoneNo: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')])
      }),
      clientAddress: this.formBuilder.group({
        streetNo:new FormControl ('', [Validators.required,Validators.pattern('^[0-9]*$')]),
        streetName:new FormControl ('', Validators.required),
        town: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        postalCode:new FormControl ('', [Validators.required,Validators.pattern('^[0-9]*$')])
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
      type:new FormControl  ('', Validators.required),
      companyName: [this.selectedCompanyName, Validators.required] // Initialize companyName with selectedCompanyName and apply required validator
    });
  }
  

  get items(): FormArray {
    return this.formData.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      desc:new FormControl  ('', Validators.required),
      price: new FormControl ('', [Validators.required,Validators.pattern('^[0-9]*$')]),
      qty: new FormControl ('', [Validators.required,Validators.pattern('^[0-9]*$')])
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
currentForm: string = 'form1';

toggleForms(form: string) {
  this.currentForm = form;
}

setActiveMenuItem(menuItem: string) {
  this.activeMenuItem = menuItem;
}
  prevStep(): void {
    this.currentStep--;
  }
  // Assuming this is within your component class
  businessInfoResponse!: BusinessInfoResponse; // Assuming you have a property to store the JSON response

fetchBusinessInfo(): void {
  this.http.get<BusinessInfoResponse>('http://localhost:8080/user/email/' + this.email)
    .subscribe(
      (response: BusinessInfoResponse) => {
        this.businessInfoResponse = response; // Store the JSON response
        this.selectedCompanyName = response.companyName; // Set selectedCompanyName from the response
        this.formData.get('companyName')?.setValue(this.selectedCompanyName); // Update companyName form control
        console.log(this.selectedCompanyName); // Log the selected company name
      },
      error => {
        console.error('Error fetching business information:', error);
      }
    );
}
  
  

  getCompanyName(): string {
    if (this.businessInfoList.length > 0) {
      return this.businessInfoList[0].companyName; // Assuming you want to display the first company name
    } else {
      return ''; // Return an empty string if businessInfoList is empty
    }
  }
    // Flag to track form submission
    submittingForm: boolean = false;


    onSubmit(): void {
      this.submittingForm = true; // Set submittingForm flag to true
  
      const token = localStorage.getItem('token');
      if (token) {
        const email = this.extractEmailFromToken(token);
        const backendUrl = `http://localhost:8080/user/createInvoiceOrQuote?email=${email}`;
        this.http.post<any>(backendUrl, this.formData.value).subscribe(
          (response: any) => {
            console.log('Invoice or Quote submitted successfully:', response);
            this.showAlertMessage('success', 'Invoice or Quote submitted successfully:');
            
          setTimeout(() => {
           
            // Refresh the page after 3 seconds
            window.location.reload();
          
        }, 3000);
          },
          (error: any) => {
            console.error('Error submitting form data:', error);
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