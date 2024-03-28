export class Company {
    companyName: string;
    city: string;
    postalCode: string;
    streetName: string;
    streetNo: string;
    town: string;
  
    constructor(
      companyName: string,
      city: string,
      postalCode: string,
      streetName: string,
      streetNo: string,
      town: string
    ) {
      this.companyName = companyName;
      this.city = city;
      this.postalCode = postalCode;
      this.streetName = streetName;
      this.streetNo = streetNo;
      this.town = town;
    }
}
