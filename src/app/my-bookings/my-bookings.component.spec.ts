import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { MyBookingsComponent } from './my-bookings.component';
import { BookingService } from '../services/bookings.service';

class MockBookingService {
  getBookings = jasmine.createSpy('getBookings').and.returnValue(of([]));
}

describe('MyBookingsComponent', () => {
  let fixture: ComponentFixture<MyBookingsComponent>;
  let component: MyBookingsComponent;
  let bookingService: MockBookingService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBookingsComponent],
      providers: [
        { provide: BookingService, useClass: MockBookingService },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookingsComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(
      BookingService,
    ) as unknown as MockBookingService;
    router = TestBed.inject(Router);
  });

  it('calculates upcoming bookings count', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    bookingService.getBookings.and.returnValue(
      of([{ booking_date: past }, { booking_date: future }] as any),
    );

    fixture.detectChanges();

    expect(component.upcomingCount).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('navigates to bookings list', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.openBookingsList();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/bookings']);
  });
});
