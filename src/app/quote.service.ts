import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quote } from './quote';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private baseUrl = 'http://localhost:8080/user/homeQuotes'; // Assuming your backend serves the API from the same host

  constructor(private http: HttpClient) { }

  getQuotes(email: string): Observable<Quote[]> {
    return this.http.get<Quote[]>(`${this.baseUrl}?email=${email}`);
  }
}
