import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { EnrichedBooking } from '../models/bookings';

@Component({
  selector: 'app-upcoming-bookings-row',
  imports: [CommonModule, CardModule],
  templateUrl: './upcoming-bookings-row.component.html',
  styleUrl: './upcoming-bookings-row.component.scss'
})
export class UpcomingBookingsRowComponent implements OnInit {
  @Input() title: string = 'Upcoming Bookings';
  @Input() bookings: EnrichedBooking[] = [];
  @Input() defaultImage: string = './images/hp3.jpg';
  @Output() bookingClick = new EventEmitter<EnrichedBooking>();

  ngOnInit() {
    console.log('Bookings received in component:', this.bookings);
  }

  onBookingClick(booking: EnrichedBooking) {
    console.log('Booking clicked:', booking);
    this.bookingClick.emit(booking);
  }

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'Date TBD';
    
    try {
      const date =
        dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  }

  getEventName(booking: EnrichedBooking, index: number): string {
    const show = booking.show_details as any;
    const eventName = show?.event?.name ?? show?.Event?.Name;
    return eventName || `Event ${index + 1}`;
  }

  getShowDate(booking: EnrichedBooking): string | undefined {
    const show = booking.show_details as any;
    const rawDate = show?.show_date ?? show?.ShowDate;
    if (!rawDate) return undefined;
    return rawDate instanceof Date ? rawDate.toISOString() : rawDate;
  }

  getShowTime(booking: EnrichedBooking): string {
    const show = booking.show_details as any;
    return show?.show_time ?? show?.ShowTime ?? 'Time TBD';
  }

  getVenueName(booking: EnrichedBooking): string {
    const venue = this.getVenue(booking);
    return venue?.venue_name ?? venue?.Name ?? 'Venue TBD';
  }

  getVenueCity(booking: EnrichedBooking): string {
    const venue = this.getVenue(booking);
    return venue?.city ?? venue?.City ?? 'City TBD';
  }

  private getVenue(booking: EnrichedBooking): any {
    const show = booking.show_details as any;
    return show?.venue ?? show?.Venue;
  }
}
