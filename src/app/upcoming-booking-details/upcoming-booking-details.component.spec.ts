import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UpcomingBookingDetailsComponent } from './upcoming-booking-details.component';
import { BookingUtilsService } from '../services/booking-utils.service';

class MockBookingUtilsService {
  formatDate = jasmine.createSpy('formatDate').and.returnValue('Feb 11, 2026');
  formatTime = jasmine.createSpy('formatTime').and.returnValue('07:30 PM');
  downloadTicketPDF = jasmine
    .createSpy('downloadTicketPDF')
    .and.returnValue(Promise.resolve());
}

describe('UpcomingBookingDetailsComponent', () => {
  let fixture: ComponentFixture<UpcomingBookingDetailsComponent>;
  let component: UpcomingBookingDetailsComponent;
  let bookingUtils: MockBookingUtilsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingBookingDetailsComponent],
      providers: [
        { provide: BookingUtilsService, useClass: MockBookingUtilsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingBookingDetailsComponent);
    component = fixture.componentInstance;
    bookingUtils = TestBed.inject(
      BookingUtilsService,
    ) as unknown as MockBookingUtilsService;
  });

  it('closes the dialog and emits visibility', () => {
    const emitSpy = spyOn(component.visibleChange, 'emit');
    component.visible = true;

    component.closeDialog();

    expect(component.visible).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('formats date and time through service', () => {
    component.booking = { booking_id: 'b1', show_date: '2026-02-11' } as any;

    expect(component.formatDate('2026-02-11')).toBe('Feb 11, 2026');
    expect(component.showTime).toBe('07:30 PM');
    expect(bookingUtils.formatDate).toHaveBeenCalled();
    expect(bookingUtils.formatTime).toHaveBeenCalled();
  });

  it('downloads the ticket pdf', fakeAsync(() => {
    component.booking = { booking_id: 'b1' } as any;

    component.downloadTicketPDF();

    expect(component.isGeneratingPDF).toBe(true);
    tick();
    expect(bookingUtils.downloadTicketPDF).toHaveBeenCalled();
    expect(component.isGeneratingPDF).toBe(false);
  }));
});
