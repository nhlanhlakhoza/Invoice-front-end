import { TestBed } from '@angular/core/testing';

import { SignuserService } from './signuser.service';

describe('SignuserService', () => {
  let service: SignuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
