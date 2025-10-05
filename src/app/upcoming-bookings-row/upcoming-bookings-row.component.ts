import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { EnrichedBooking } from '../models/bookings';

@Component({
  selector: 'app-upcoming-bookings-row',
  imports: [CommonModule, CardModule],
  templateUrl: './upcoming-bookings-row.component.html',
  styleUrl: './upcoming-bookings-row.component.scss'
})
export class UpcomingBookingsRowComponent {
  @Input() title: string = 'Upcoming Bookings';
  @Input() bookings: EnrichedBooking[] = [];
  @Input() defaultImage: string = './images/hp3.jpg';
  @Output() bookingClick = new EventEmitter<EnrichedBooking>();

  onBookingClick(booking: EnrichedBooking) {
    this.bookingClick.emit(booking);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Date TBD';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  }
}
