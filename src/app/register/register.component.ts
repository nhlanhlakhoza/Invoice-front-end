import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface FormData {
  user: {
    fullName: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
  };
  businessInfo: {
    companyName: string;
    streetNo: string;
    streetName: string;
    city: string;
    postalCode: string;
    town: string;
    taxNo:string;
    email:string;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  companyForm!: FormGroup;
  showAlert: boolean = false;
  alertMessage: any;
  alertType: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone_number: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      confirm_password: new FormControl('', [Validators.required]),
    }, {
      validators: this.MustMatch('password', 'confirm_password')
    });

    this.companyForm = this.fb.group({
      companyName: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      postal_code: new FormControl('', [Validators.required]),
      street_name: new FormControl('', [Validators.required]),
      streetNo: new FormControl('', [Validators.required]),
      town: new FormControl('', [Validators.required]),
      taxNo: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  get register() {
    return this.registerForm.controls;
  }

  get company() {
    return this.companyForm.controls;
  }

  // Toggling through the buttons
  currentForm: string = 'register';

  toggleForms(form: string) {
    this.currentForm = form;
  }

  MustMatch(password: any, confirm_password: any) {
    return (formGroup: FormGroup) => {
      const passwordcontrol = formGroup.controls[password];
      const confirm_passwordcontrol = formGroup.controls[confirm_password];

      if (confirm_passwordcontrol.errors && !confirm_passwordcontrol.errors['MustMatch']) {
        return;
      }
      if (passwordcontrol.value !== confirm_passwordcontrol.value) {
        confirm_passwordcontrol.setErrors({ 'MustMatch': true });
      } else {
        confirm_passwordcontrol.setErrors(null);
      }
    };
  }
    // Flag to track form submission
    submittingForm: boolean = false;
    SignUser() {
      this.submittingForm = true; // Set submittingForm flag to true
  
      const formData: FormData = {
        user: {
          fullName: this.registerForm.value.fullName,
          username: this.registerForm.value.username,
          email: this.registerForm.value.email,
          phone_number: this.registerForm.value.phone_number,
          password: this.registerForm.value.password
        },
        businessInfo: {
          companyName: this.companyForm.value.companyName,
          streetNo: this.companyForm.value.streetNo,
          streetName: this.companyForm.value.street_name,
          city: this.companyForm.value.city,
          postalCode: this.companyForm.value.postal_code,
          town: this.companyForm.value.town,
          email:this.companyForm.value.email,
          taxNo:this.companyForm.value.taxNo
        }
      };
  
      this.http.post('https://ravishing-youth-production.up.railway.app/register', formData).subscribe(
        () => {
          this.showAlertMessage('success', 'Registered successfully');
  
          setTimeout(() => {
            // Redirect to login page after successful registration
            this.router.navigate(['/login']);
          }, 2000);
        },
        () => {
          this.showAlertMessage('error', 'Sorry, registration failed.');
        }
      ).add(() => {
        this.submittingForm = false; // Set submittingForm flag to false when request completes
      });
    }

  showAlertMessage(type: string, message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({
        image: file
      });
    }
  }
}
