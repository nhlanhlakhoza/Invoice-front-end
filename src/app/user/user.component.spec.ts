import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  formData!: FormGroup;
nextStep: any;
prevStep: any;

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
        totalAmount: ['', Validators.required]
      }),
      quote: this.formBuilder.group({
        totalAmount: ['', Validators.required]
      }),
      items: this.formBuilder.array([
        this.createItem()
      ]),
      type: ['', Validators.required]
    });
  }

  get items() {
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

  onSubmit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const email = this.extractEmailFromToken(token);
      const backendUrl = `http://localhost:8081/user/createInvoiceOrQuote?email=${email}`;
      this.http.post<any>(backendUrl, this.formData.value).subscribe(
        (response: any) => {
          console.log('Form data submitted successfully:', response);
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
}
