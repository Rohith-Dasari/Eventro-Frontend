import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PaymentSuccessComponent } from './payment-success.component';
import { BookingService } from '../services/bookings.service';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  getCurrentNavigation() {
    return null;
  }
}

class MockBookingService {
  getBookings = jasmine.createSpy('getBookings').and.returnValue(of([]));
}

describe('PaymentSuccessComponent', () => {
  let fixture: ComponentFixture<PaymentSuccessComponent>;
  let component: PaymentSuccessComponent;
  let router: MockRouter;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PaymentSuccessComponent],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: BookingService, useClass: MockBookingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentSuccessComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('redirects when payment data is missing', () => {
    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/events']);
  });

  it('uses session storage payment data when available', () => {
    sessionStorage.setItem(
      'paymentData',
      JSON.stringify({ eventName: 'Event' }),
    );

    component.ngOnInit();

    expect(component.bookingData.eventName).toBe('Event');
    expect(component.generatedBookingId).toContain('BK');
  });
});
