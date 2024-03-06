import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors,ValidatorFn } from '@angular/forms';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent 
{

  changeProfileForm: FormGroup = new FormGroup
  ({
    id: new FormControl('0'),
    fullName: new FormControl('', Validators.required),
    emailAddress: new FormControl('',  [Validators.required, Validators.email]),
    phone_number: new FormControl('',  [Validators.required, this.mobileNumberValidator() ]),
    password: new FormControl('',  [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    confirm_password: new FormControl('',  Validators.required)
});

  currentForm: string = 'form1';

  toggleForms(form: string) {
    this.currentForm = form;
  }

  //Change profile Information
get change (){return this.changeProfileForm.controls;}

  constructor(private router: Router) { }

  navigateToDestination() {
      this.router.navigate(['/settings']);
  }

  navigateToProfile() {
    this.router.navigate(['/changePasswordSetting']);
}
  mobileNumberValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (isNaN(value)) {
        return { 'notANumber': { value: value } };
      }
     
      const mobileNumberRegex = /^[A-Z]{10}$/; // Change this regex based on your mobile number format
      const valid = mobileNumberRegex.test(value);
      return valid ? null : { 'invalidMobileNumber': { value: value } };
    };
  }

}
