import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any;
  usernames: string = '';
  fullName: string = '';
  email: string = '';
  phone_number: string = '';
  file!: File;
  profileForm!: FormGroup;
  profileImage: any = 'assets/img/default2.jpg';
  message: string = '';
  alertType!: string;
  showAlert!: boolean;
  alertMessage!: string;
  showPrompt: boolean = false;

  

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {}

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
        username: [this.usernames, [Validators.required,Validators.maxLength(10)]],
        phone_number: [this.phone_number, [Validators.required, Validators.pattern('[0-9]{10}')]],
        email: [this.email, [Validators.required, Validators.email]],
      });
    } else {
      console.error('Token not found.');
    }

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';
    this.fileInput.addEventListener('change', (event: any) => this.onFileSelected(event));
    document.body.appendChild(this.fileInput);
  }

  fetchProfilePictureByEmail(email: string) {
    this.http.get('http://localhost:8080/user/displayProfileImage', {
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

  updateProfile() {
    const formData = new FormData();
  
    formData.append('file', this.file || null);
    formData.append('username', this.profileForm.value.username);
    formData.append('fullName', this.profileForm.value.fullName);
    formData.append('email', this.profileForm.value.email);
    formData.append('phone_number', this.profileForm.value.phone_number);
    
    this.http.post<any>('http://localhost:8080/user/updateProfile', formData).subscribe(
      response => {
        console.log('Response from server:', response);
        this.showAlertMessage('success', response.message);
        const token = response.token;
        localStorage.setItem('token', token);
      },
      error => {
        console.error('Error updating profile:', error);
        this.showAlertMessage('error', 'Sorry, please verify all the fields');
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

  confirmAction(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'remove') {
        // Set default profile image
     this.profileImage = 'assets/img/default2.jpg';
     this.removeProfile();
     
    
      } else if (result === 'upload') {
        
        if (this.fileInput) {
          this.fileInput.nativeElement.click();
        }
      }
    });
  }

  removeProfile() {
    const url = 'http://localhost:8080/update-image?email=' + this.email;
  
    this.http.post(url, null).subscribe(
      () => {
        // Image removed successfully
        console.log('Image removed successfully');
        // Update UI or perform other actions as needed
      },
      (error) => {
        // Handle error
        console.error('Error removing image:', error);
        // Display error message or handle the error accordingly
      }
    );
  }
  
  
  
  }
  

