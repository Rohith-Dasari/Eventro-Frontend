import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingBookingsRowComponent } from './upcoming-bookings-row.component';

describe('UpcomingBookingsRowComponent', () => {
  let fixture: ComponentFixture<UpcomingBookingsRowComponent>;
  let component: UpcomingBookingsRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingBookingsRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingBookingsRowComponent);
    component = fixture.componentInstance;
  });

  it('emits when a booking is clicked', () => {
    const booking = { booking_id: 'b1' } as any;
    const emitSpy = spyOn(component.bookingClick, 'emit');

    component.onBookingClick(booking);

    expect(emitSpy).toHaveBeenCalledWith(booking);
  });

  it('formats dates and times', () => {
    expect(component.formatDate(undefined)).toBe('Date TBD');
    expect(component.formatDate('invalid-date')).toBe('Invalid Date');
    expect(component.getShowTime({} as any)).toBe('Time TBD');
  });

  it('falls back to generated event name', () => {
    expect(component.getEventName({} as any, 1)).toBe('Event 2');
  });
});
