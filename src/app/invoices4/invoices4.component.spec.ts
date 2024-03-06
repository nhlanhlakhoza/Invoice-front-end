import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Invoices4Component } from './invoices4.component';

describe('Invoices4Component', () => {
  let component: Invoices4Component;
  let fixture: ComponentFixture<Invoices4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Invoices4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Invoices4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
