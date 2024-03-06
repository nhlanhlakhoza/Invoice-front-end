import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SignuserService } from '../signuser.service';
import { Users } from '../users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  showAlert: boolean = false;
  alertMessage: any;
  alertType: any;
 

  constructor(private fb: FormBuilder, private signUserService: SignuserService,private router: Router) {
    this.registerForm = this.fb.group({
      id: new FormControl('0'),
      fullName: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone_number: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      confirm_password: new FormControl('', [Validators.required]),
    }, {
      validators: this.MustMatch('password', 'confirm_password')
    });
  }

  get register() {
    return this.registerForm.controls;
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

  SignUser() {
  
    const user: Users = Object.assign({}, this.registerForm.value);
    console.log("submitted", this.registerForm);
    this.signUserService.signUser(user).subscribe(
      data => {
        this.showAlertMessage('success', 'Registered successfully');

        setTimeout(() => {
          
          // Redirect to dashboard after 2 seconds
          this.router.navigate(['/login']);
        }, 2000);
      },
      error => {
        this.showAlertMessage('error', 'Sorry, the user already exists.');
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({
        image: file
      });
    }
  }
}
