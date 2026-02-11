import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { BookingConfirmationComponent } from './booking-confirmation.component';
import { BookingService } from '../services/bookings.service';
import { AuthService } from '../services/auth.service';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockLocation {
  back = jasmine.createSpy('back');
}

class MockBookingService {
  addBooking = jasmine
    .createSpy('addBooking')
    .and.returnValue(of({ booking_id: 'b1' }));
}

class MockAuthService {
  getRole() {
    return 'customer';
  }
  getID() {
    return 'user-1';
  }
  getUserByMailID = jasmine
    .createSpy('getUserByMailID')
    .and.returnValue(of({ UserID: 'user-2' }));
}

describe('BookingConfirmationComponent', () => {
  let fixture: ComponentFixture<BookingConfirmationComponent>;
  let component: BookingConfirmationComponent;
  let router: MockRouter;
  let location: MockLocation;
  let bookingService: MockBookingService;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BookingConfirmationComponent],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: Location, useClass: MockLocation },
        { provide: BookingService, useClass: MockBookingService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingConfirmationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    location = TestBed.inject(Location) as unknown as MockLocation;
    bookingService = TestBed.inject(
      BookingService,
    ) as unknown as MockBookingService;
  });

  afterEach(() => {
    sessionStorage.clear();
    history.replaceState({}, '');
  });

  it('redirects when no booking data is found', () => {
    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/events']);
  });

  it('loads booking data from history state', () => {
    history.replaceState({ bookingData: { seats: ['A1'] }, showId: 's1' }, '');

    component.ngOnInit();

    expect(component.bookingData.seats.length).toBe(1);
    expect(component.showId).toBe('s1');
  });

  it('cancels and clears storage', () => {
    sessionStorage.setItem('bookingData', JSON.stringify({ seats: ['A1'] }));
    sessionStorage.setItem('selectedShowId', 's1');

    component.onCancel();

    expect(location.back).toHaveBeenCalled();
    expect(sessionStorage.getItem('bookingData')).toBeNull();
  });

  it('processes payment when data is valid', fakeAsync(() => {
    history.replaceState({ bookingData: { seats: ['A1'] }, showId: 's1' }, '');

    component.ngOnInit();
    component.onPay();

    expect(bookingService.addBooking).toHaveBeenCalledWith('s1', ['A1'], null);
    tick();
    expect(router.navigate).toHaveBeenCalledWith([
      '/dashboard/payment-success',
    ]);
  }));
});
