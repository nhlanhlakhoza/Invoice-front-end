import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usernames: string = '';
  fullName: string = '';
  email: string = '';
  phone_number: string = '';
  file!: File;
  profileForm!: FormGroup;
  profileImage: any = 'assets/img/default.jpg';
  message: string = '';
  alertType!: string;
  showAlert!: boolean;
  alertMessage!: string;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));

      this.usernames = decodedPayload.username;
      this.fullName = decodedPayload.fullName;
      this.email = decodedPayload.email;
      this.phone_number = decodedPayload.phone_number;

      this.fetchProfilePictureByEmail(this.email);

      this.profileForm = this.formBuilder.group({
        id: ['0'],
        fullName: [this.fullName, [Validators.required]],
        username: [this.usernames, [Validators.required]],
        phone_number: [this.phone_number, [Validators.required,Validators.pattern('[0-9]{10}')]],
        email: [this.email, [Validators.required,Validators.email]],
       // password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      //  confirm_password: ['', [Validators.required]],
      },// {
        //validators: this.MustMatch('password', 'confirm_password')
     // }
      );
    } else {
      console.error('Token not found.');
    }
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


  fetchProfilePictureByEmail(email: string) {
    this.http.get('http://localhost:8081/user/displayProfileImage', {
      responseType: 'blob',
      params: { email: this.email },
    }).subscribe(
      (response: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.profileImage = reader.result;
        };
        reader.readAsDataURL(response);
      },
      error => {
        console.error('Error fetching profile image:', error);
      }
    );
  }

  addImage: string = 'assets/img/Group 2.svg';
  imageUrl!: string | ArrayBuffer | null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.file = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.profileImage = reader.result;
      };
      this.updateProfile();
    }
  }

  get change() {
    return this.profileForm.controls;
  }
  // Method to check if passwords match
  passwordsMatch(): boolean {
    const password = this.profileForm.get('password')?.value;
    const confirm_password = this.profileForm.get('confirm_password')?.value;
    return password === confirm_password;
  }
  updateProfile() {
    const formData = new FormData();
  
    formData.append('file', this.file || null);
    formData.append('username', this.profileForm.value.username);
    formData.append('fullName', this.profileForm.value.fullName);
    formData.append('email', this.profileForm.value.email);
    formData.append('phone_number', this.profileForm.value.phone_number);
    
    this.http.post<any>('http://localhost:8081/user/updateProfile', formData).subscribe(
      response => {
        console.log('Response from server:', response);
        this.showAlertMessage('success', response.message);
        const token = response.token;
        localStorage.setItem('token', token);
      },
      error => {
        console.error('Error updating profile:', error);
        this.showAlertMessage('error', 'Sorry, please verify all the field');
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
