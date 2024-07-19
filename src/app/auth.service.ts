import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt'
import { TokenApiModel } from './models/token-api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'https://ravishing-youth-production.up.railway.app/user'; // Your backend API base URL

  constructor(private http: HttpClient) { }

  verifyOldPassword(email: string, password: string): Observable<any> {
    // Make a POST request to your backend API to verify the old password
    return this.http.post<any>(`${this.baseUrl}/verifyOldPassword`, { email, password });
  }

  changePassword(email: string, password: string): Observable<any> {
    // Make a POST request to your backend API to change the password
    return this.http.post<any>(`${this.baseUrl}/changePassword`, { email, password });
  }
  }
 



