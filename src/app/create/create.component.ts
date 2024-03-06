import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';

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
}


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css', 'one.css', 'two.css', 'three.css']
})
export class CreateComponent {
  formData!: FormGroup;
  currentStep: number = 1;
  activeMenuItem!: string;
  alertMessage!: string;
  alertType!: string;
  showAlert!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.formData = this.formBuilder.group({
      client: this.formBuilder.group({
        f_name: ['', Validators.required],
        l_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNo: ['', Validators.required]
      }),
      clientAddress: this.formBuilder.group({
        streetNo: ['', Validators.required],
        streetName: ['', Validators.required],
        town: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required]
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
      type: ['', Validators.required]
    });
  }

  get items(): FormArray {
    return this.formData.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      desc: ['', Validators.required],
      price: ['', Validators.required],
      qty: ['', Validators.required]
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
  onSubmit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.extractEmailFromToken(token);
      const backendUrl = `http://localhost:8081/user/createInvoiceOrQuote?email=${email}`;
      this.http.post<any>(backendUrl, this.formData.value).subscribe(
        (response: any) => {
          console.log('Form data submitted successfully:', response);
          this.showAlertMessage('success', 'Form data submitted successfully:');
        },
        (error: any) => {
          console.error('Error submitting form data:', error);
          console.log(backendUrl);
          console.log(email);
        }
      );
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
