import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {

  forgotForms: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  showAlert: boolean = false; // Initialize showAlert to false
  alertMessage: any;
  alertType: any;

  get forgot_password() {
    return this.forgotForms.controls;
  }

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  submittingForm: boolean = false;
  sendData() {
    if (this.forgotForms.valid) {
      const email = this.forgotForms.get('email')?.value;

      const data = {
        email: email
      };
      this.submittingForm = true;
      this.http.post<any>('http://localhost:8081/forgotPassword', data)
        .subscribe(
          response => {
            console.log('Reset password request sent successfully!', response);
            this.showAlertMessage('success', 'Password reset request sent successfully! Please check your email.');
            // Handle response as needed
          },
          error => {
            console.error('Error sending reset password request:');
            this.showAlertMessage('error', 'Error sending reset password request. Please ensure the email you entered is correct.');
            // Handle error as needed
          }
        ).add(() => {
          this.submittingForm = false;
        });
    } else {
      this.showAlertMessage('error', 'Please enter a valid email address.');
    }
  }

  showAlertMessage(type: string, onmessage: string) {
    this.alertType = type;
    this.alertMessage = onmessage;
    this.showAlert = true;

    // Hide the alert after 5 seconds
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
