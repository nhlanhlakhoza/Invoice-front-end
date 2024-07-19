import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.changePasswordForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
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
  resetPassword() {
    const email = this.changePasswordForm.get('email')?.value;
    const password = this.changePasswordForm.get('password')?.value;
    const data = {
      email: email,
      password: password
    };

    this.http.post<any>('https://ravishing-youth-production.up.railway.app/user/resetPassword', data).subscribe(
      (response) => {
        console.log('Password reset successfully!', response);
        this.showAlertMessage('success', 'Reset password request sent successfully!');
        setTimeout(() => {
          // Redirect to login page after 1 seconds
          this.router.navigate(['/login']);
        }, 2000); // 2000 milliseconds =2  seconds
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
