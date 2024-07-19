import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private baseUrl = 'https://ravishing-youth-production.up.railway.app/user'; // Adjust this URL to match your backend base URL

  constructor(private http: HttpClient) { }

  getTotalUnpaid(email: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/getTotalUnpaid?email=${email}`);
  }
}
