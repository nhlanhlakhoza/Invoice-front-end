import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-satus',
  templateUrl: './payment-satus.component.html',
  styleUrl: './payment-satus.component.css'
})
export class PaymentSatusComponent {
  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}

  public changeStatus(email: string, invoiceNo: number): void {
    const url = `http://localhost:8081/user/${email}/${invoiceNo}`;
    this.http.get(url).subscribe(
      () => {
        // Success message
        this.snackBar.open('Payment successful!', 'Close', {
          duration: 3000, // Duration in milliseconds
        });
      },
      (error: any) => {
        // Handle error if needed
        console.error('Error changing status:', error);
      }
    );
  }
}