export class Invoice {
    id: number;
    totalAmount: number;
  date: Date;
  customer: string;

  constructor(id: number, totalAmount: number, date: Date, customer: string) {
    this.id = id;
    this.totalAmount =totalAmount;
    this.date = date;
    this.customer = customer;
  }
}
