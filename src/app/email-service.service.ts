import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailServiceService {
  private email!: string; // Define email variable to store the email

  constructor(private http: HttpClient) { }

  getUserEmailFromToken(token: string): string {
    if (token) {
      const tokenParts = token.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));

      // Store the email
      this.email = decodedPayload.email;

      return this.email;
    } else {
      console.error('Token not found.');
      return "null";
    }
  }

  sendEmailToBackend(data: any) {
    // Make sure you have the email stored in this.email variable
    // Send the email along with other data to the backend
    return this.http.post('https://invoiceapp-17.onrender.com/user/createInvoiceOrQuote', data, {
      params: {
        email: this.email // Send the email as a parameter to the backend
      }
    });
  }
  
}
