import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {

  constructor() { }

  getUsernameFromToken(token: string): string | null {
    try {
      const decoded: any = jwt_decode(token);
      return decoded.username; // Assuming 'username' is the field in your token payload
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
function jwt_decode(token: string): any {
  throw new Error('Function not implemented.');
}

