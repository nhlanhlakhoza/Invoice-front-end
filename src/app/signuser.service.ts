import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from './users';

@Injectable({
  providedIn: 'root'
})
export class SignuserService {

  private baseUrl= "https://ravishing-youth-production.up.railway.app/register";
  constructor( private httpClient: HttpClient) { }

signUser(users:Users):Observable<any> {

console.log(users);
return this.httpClient.post(this.baseUrl,users);
  }
}
