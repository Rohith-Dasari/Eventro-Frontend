import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BookingService } from './bookings.service';
import { ApiResponse } from '../models/api-response';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds booking with user identifier', () => {
    service.addBooking('show-1', ['A1'], 'user-1').subscribe();

    const req = httpMock.expectOne('bookings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      show_id: 'show-1',
      seats: ['A1'],
      user_id: 'user-1',
    });
    req.flush({
      message: 'ok',
      status_code: 200,
      data: { booking_id: 'b1' },
    } as ApiResponse<any>);
  });

  it('returns empty list when no user id is found', () => {
    let result: any[] | undefined;
    service.getBookings().subscribe((data) => {
      result = data;
    });

    expect(result).toEqual([]);
  });

  it('fetches bookings using stored user id', () => {
    localStorage.setItem('user_id', 'u1');
    service.getBookings().subscribe();

    const req = httpMock.expectOne('users/u1/bookings');
    expect(req.request.method).toBe('GET');
    req.flush({
      message: 'ok',
      status_code: 200,
      data: [],
    } as ApiResponse<any>);
  });
});
