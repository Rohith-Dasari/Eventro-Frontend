import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Booking } from '../models/bookings';

@Component({
  selector: 'app-upcoming-bookings-row',
  imports: [CommonModule, CardModule],
  templateUrl: './upcoming-bookings-row.component.html',
  styleUrl: './upcoming-bookings-row.component.scss'
})
export class UpcomingBookingsRowComponent implements OnInit {
  @Input() title: string = 'Upcoming Bookings';
  @Input() bookings: Booking[] = [];
  @Input() defaultImage: string = './images/hp3.jpg';
  @Output() bookingClick = new EventEmitter<Booking>();

  ngOnInit() {
    console.log('Bookings received in component:', this.bookings);
  }

  onBookingClick(booking: Booking) {
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

  getEventName(booking: Booking, index: number): string {
    return booking.event_name || `Event ${index + 1}`;
  }

  getShowDate(booking: Booking): string | undefined {
    return booking.booking_date;
  }

  getShowTime(booking: Booking): string {
    return this.formatTime(booking.booking_date);
  }

  getVenueName(booking: Booking): string {
    return booking.venue_name || 'Venue TBD';
  }

  getVenueCity(booking: Booking): string {
    return booking.venue_city || 'City TBD';
  }

  private formatTime(dateInput: string | Date | undefined): string {
    if (!dateInput) {
      return 'Time TBD';
    }
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return 'Time TBD';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
