import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user';
import { Observable } from 'rxjs';


interface AuthenticationResponse {
  token: string;
}
@Injectable({
  providedIn: 'root'
})
export class LoginuserService {

  private baseUrl= "http://localhost:8081/login";
  constructor( private httpClient: HttpClient) { }

loginUser(user:User):Observable<any> {
console.log(user);
return this.httpClient.post(this.baseUrl,user);
  }
}
