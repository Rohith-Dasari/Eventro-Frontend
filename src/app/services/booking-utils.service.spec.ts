import { BookingUtilsService } from './booking-utils.service';

describe('BookingUtilsService', () => {
  let service: BookingUtilsService;

  beforeEach(() => {
    service = new BookingUtilsService();
  });

  it('formats dates and times', () => {
    expect(service.formatDate(undefined)).toBe('Date TBD');
    expect(service.formatTime(undefined)).toBe('Time TBD');

    const date = new Date('2026-02-11T19:30:00');
    expect(service.formatDate(date)).toContain('2026');
    expect(service.formatTime(date)).toContain(':');
  });

  it('generates QR data from booking', () => {
    const booking = {
      booking_id: 'b1',
      event_id: 'e1',
      event_name: 'Event',
      show_id: 's1',
      seats: ['A1', 'A2'],
      total_price: 200,
      show_date: '2026-02-11',
      venue_name: 'Venue',
      venue_city: 'City',
      venue_state: 'State',
      time_booked: 'now',
    } as any;

    const data = JSON.parse(service.generateQRData(booking));

    expect(data.bookingId).toBe('b1');
    expect(data.numTickets).toBe(2);
    expect(data.venueName).toBe('Venue');
  });
});
