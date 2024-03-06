import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  usernames: string = '';
  fullName: string = '';
  email: string = '';
  phone_number: string = '';
  file!: File;
  profileForm!: FormGroup;
  profileImage: any; // Set default profile picture
  message: string = '';
  alertType!: string;
  showAlert!: boolean;
  alertMessage!: string;
  isPageRefreshed: any;
  refreshDone: any;

  constructor(private http: HttpClient, private formBuilder: FormBuilder,private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
   
    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));

      this.usernames = decodedPayload.username;
      this.fullName = decodedPayload.fullName;
      this.email = decodedPayload.email;
      this.phone_number = decodedPayload.phone_number;

      // Fetch the user's profile picture
      this.fetchProfilePictureByEmail(this.email);
    } else {
      console.error('Token not found.');
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
        // If fetching fails, the default picture will remain
      
      }
    );
  }


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
    
    }
  }
  updateProfile() {
    throw new Error('Method not implemented.');
  }

  navigateToDestination() {
    this.router.navigate(['/settings']);
  }

  isDropdownOpen: boolean = false;

  toggleDropdown(event: any): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  
}
