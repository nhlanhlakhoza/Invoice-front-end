import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-password-change-setting',
  templateUrl: './password-change-setting.component.html',
  styleUrls: ['./password-change-setting.component.css']
})
export class PasswordChangeSettingComponent {
  usernames: string = '';
  fullName: string = '';
  email: string = '';
  oldpassword:string='';
  phone_number: string = '';
  file!: File;
  profileForm!: FormGroup;
  profileImage: any = 'assets/img/default.jpg';
  message: string = '';
  alertType!: string;
  showAlert!: boolean;
  alertMessage!: string;
  showEmailInput: boolean = false;
  error!: string;
  oldPassword: string = '';
  newPassword: string = '';
  
  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));

      this.usernames = decodedPayload.username;
      this.fullName = decodedPayload.fullName;
      this.email = decodedPayload.email;
      this.phone_number = decodedPayload.phone_number;

      this.profileForm = this.formBuilder.group({
        email: [this.email, [Validators.email]],
        oldpassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
        confirm_password: ['', [Validators.required]],
      }, {
        validators: this.MustMatch('password', 'confirm_password')
      });
    } else {
      console.error('Token not found.');
    }
  }
  get change() {
    return this.profileForm.controls;
  }
  MustMatch(password: string, confirm_password: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirm_passwordControl = formGroup.controls[confirm_password];

      if (confirm_passwordControl.errors && !confirm_passwordControl.errors['MustMatch']) {
        return;
      }
      if (passwordControl.value !== confirm_passwordControl.value) {
        confirm_passwordControl.setErrors({ 'MustMatch': true });
      } else {
        confirm_passwordControl.setErrors(null);
      }
    }
  }

  resetPassword() {
     // Get the value of the oldpassword field from the form
  const oldPasswordValue = this.profileForm.get('oldpassword')?.value;
    this.authService.verifyOldPassword(this.email, oldPasswordValue)
      .subscribe(
        (response) => {
          console.log(this.email)
          console.log(this.oldPassword)
          this.changePassword();

        },
        (error) => {
          console.error('Error verifying old password:', error);
          console.log(this.email)
          console.log(this.oldPassword)
          this.error = 'Old password is incorrect.';
        }
      );
  }

  changePassword() {
    const PasswordValue = this.profileForm.get('password')?.value;
    this.authService.changePassword(this.email, PasswordValue)
      .subscribe(
        (response: any) => {
          
          console.log('Password changed successfully:', response);
          this.showAlertMessage('success', 'Password changed successfully');
          this.profileForm.reset();
        },
        (error: any) => {
          console.error('Error changing password:', error);
          this.error = 'Error changing password. Please try again later.';
          this.showAlertMessage('error', 'Error changing password. Please try again later.');
        }
      );
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
