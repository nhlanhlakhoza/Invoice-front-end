import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordChangeSettingComponent } from './password-change-setting.component';

describe('PasswordChangeSettingComponent', () => {
  let component: PasswordChangeSettingComponent;
  let fixture: ComponentFixture<PasswordChangeSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasswordChangeSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordChangeSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
