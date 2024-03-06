import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user';
import { Userss } from './userss';
import {JwtHelperService} from '@auth0/angular-jwt'

@Injectable({
  providedIn: 'root'
})
export class UserService {

 private username$ = new BehaviorSubject<String>("");

    constructor() { }
  
    public getUsernameFromStore(username:String){
      return this.username$.asObservable();
    }
    public setUsernameForStore(username:String){
      this.username$.next(username);
    }
  }

