import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { ApiResponse } from '../models/api-response';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets a user profile', () => {
    service.getProfile('u1').subscribe();

    const req = httpMock.expectOne('users/u1');
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'ok',
      status_code: 200,
      data: { UserID: 'u1' },
    } as ApiResponse<any>);
  });

  it('updates a user profile', () => {
    const payload = { Username: 'User' };
    service.updateProfile('u1', payload).subscribe();

    const req = httpMock.expectOne('u1/profile');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({
      message: 'ok',
      status_code: 200,
      data: {},
    } as ApiResponse<any>);
  });
});
