import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginuserService } from '../loginuser.service';
import { User } from '../user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup = new FormGroup({
    id: new FormControl('0'),
    email: new FormControl('', [Validators.required,Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  showAlert: boolean = false;
  alertMessage: any;
  alertType: any;

  get login() {
    return this.loginForm.controls;
  }

  user: User = new User();

  constructor(private loginuserservice: LoginuserService, private router: Router) { }
  // Flag to track form submission
  submittingForm: boolean = false;
  LoginUser(){   
    this.submittingForm = true; // Set submittingForm flag to true
      this.user = Object.assign(this.user, this.loginForm.value);
      console.log("submitted", this.loginForm);
      
      this.loginuserservice.loginUser(this.user).subscribe(
        response => {
          // Successful login response handling
          
          setTimeout(() => {
            const token = response.token;
            // Store the token in local storage
            localStorage.setItem('token', token);
            // Redirect to dashboard after 2 seconds
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error => {
          // Error handling for failed login
          this.showAlertMessage('error', 'Sorry, please enter correct email and password');
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
}
