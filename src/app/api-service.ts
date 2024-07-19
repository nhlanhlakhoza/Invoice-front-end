import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "./user";
import { Users } from "./users";
import { Company } from "./company";

export class ApiService {
    
  private userRegistrationUrl = 'https://ravishing-youth-production.up.railway.app/register';
  private saveCompanyInfoUrl = 'https://ravishing-youth-production.up.railway.app/save-business-info';

  constructor(private http: HttpClient) { }

  registerUser(userData: Users): Observable<any> {
    return this.http.post<any>(this.userRegistrationUrl, userData);
  }

  storeCompanyDetails(companyData: Company): Observable<any> {
    return this.http.post<any>(this.saveCompanyInfoUrl, companyData);
  }
}

