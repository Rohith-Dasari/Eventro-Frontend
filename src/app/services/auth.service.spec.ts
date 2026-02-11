import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/api-response';

const base64UrlEncode = (value: string): string => {
  if (typeof btoa === 'function') {
    return btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const makeToken = (payload: Record<string, unknown>): string => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.sig`;
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('logs in and stores user metadata', () => {
    const token = makeToken({
      user_id: 'u1',
      email: 'test@example.com',
      role: 'customer',
    });
    const response: ApiResponse<string> = {
      message: 'ok',
      status_code: 200,
      data: token,
    };

    service.login('test@example.com', 'secret').subscribe();

    const req = httpMock.expectOne('login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('user_id')).toBe('u1');
    expect(localStorage.getItem('role')).toBe('customer');
  });

  it('logs out and clears storage', () => {
    localStorage.setItem('token', 'abc');
    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('returns login state based on token', () => {
    expect(service.isLoggedIn()).toBe(false);
    localStorage.setItem('token', 'abc');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('fetches user by email', () => {
    service.getUserByMailID('test@example.com').subscribe();

    const req = httpMock.expectOne('users/email/test@example.com');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'ok', status_code: 200, data: { UserID: 'u1' } });
  });
});
