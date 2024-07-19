import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

  changePasswordForm: FormGroup;

  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: string = '';
  email: string | null | undefined;
  token: string = ''; // Initialize token property
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.changePasswordForm = this.formBuilder.group({
      
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      confirm_password: new FormControl('', [Validators.required]),
    } ,{
      validators: this.MustMatch('password', 'confirm_password')
    });
  }

  get change_password() {
    return this.changePasswordForm.controls;
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
    }
  }
 

  resetPassword(){
    this.activatedRoute.queryParams.subscribe(params => {
      const emailParam = Object.keys(params)[0]; // Get the first parameter key
      this.email = emailParam;
  
      console.log(this.email);
     
    });

 
    if (!this.email) {
      // Handle invalid or missing token
      this.showAlertMessage('danger', 'Invalid password reset link.');
      return; // Exit function if token is invalid
    }

    const password = this.changePasswordForm.get('password')?.value;
    const data = {
      email: this.email,
      password: password,
      token: this.token // Include token in the data sent to the backend
    };

    this.http.post<any>('http://localhost:8080/user/resetPassword', data).subscribe(
      (response) => {
        console.log('Password reset successfully!', response);
        this.showAlertMessage('success', 'Reset password request sent successfully!');
        setTimeout(() => {
          // Redirect to login page after 2 seconds
          this.router.navigate(['/login']);
        }, 2000);
      },
      (error) => {
        console.error('Error resetting password:', error);
        this.showAlertMessage('error', 'Error resetting password! User not found. Please enter the email address correctly.');
      }
    );
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
