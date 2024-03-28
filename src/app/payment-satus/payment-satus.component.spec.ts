import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSatusComponent } from './payment-satus.component';

describe('PaymentSatusComponent', () => {
  let component: PaymentSatusComponent;
  let fixture: ComponentFixture<PaymentSatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentSatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentSatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
