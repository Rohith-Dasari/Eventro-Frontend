import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { BookingsListComponent } from './bookings-list.component';
import { BookingService } from '../services/bookings.service';

class MockBookingService {
  getBookings = jasmine.createSpy('getBookings').and.returnValue(of([]));
}

class MockLocation {
  back = jasmine.createSpy('back');
}

describe('BookingsListComponent', () => {
  let fixture: ComponentFixture<BookingsListComponent>;
  let component: BookingsListComponent;
  let bookingService: MockBookingService;
  let location: MockLocation;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsListComponent],
      providers: [
        { provide: BookingService, useClass: MockBookingService },
        { provide: Location, useClass: MockLocation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsListComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(
      BookingService,
    ) as unknown as MockBookingService;
    location = TestBed.inject(Location) as unknown as MockLocation;
  });

  it('loads and sorts bookings by show date', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    bookingService.getBookings.and.returnValue(
      of([
        { booking_id: 'future', show_date: future, seats: [] },
        { booking_id: 'past', show_date: past, seats: [] },
      ] as any),
    );

    fixture.detectChanges();

    expect(component.bookings[0].booking_id).toBe('past');
    expect(component.bookings[1].booking_id).toBe('future');
  });

  it('opens and closes the booking dialog', () => {
    const booking = { booking_id: 'b1', seats: [] } as any;

    component.onBookingClick(booking);
    expect(component.dialogVisible).toBe(true);
    expect(component.selectedBooking).toBe(booking);

    component.onDialogHide();
    expect(component.dialogVisible).toBe(false);
    expect(component.selectedBooking).toBeNull();
  });

  it('navigates back on goBack', () => {
    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });

  it('formats invalid dates as TBD or Invalid Date', () => {
    expect(component.formatDate(undefined)).toBe('Date TBD');
    expect(component.formatDate('invalid-date')).toBe('Invalid Date');
  });
});
