import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

export interface BookingSummaryData {
  eventName?: string;
  venueName?: string;
  venueAddress?: string;
  showDate?: string;
  showTime?: string;
  seats?: string[];
  numTickets?: number;
  totalAmount?: number;
  bookingId?: string;
}

@Component({
  selector: 'app-booking-summary',
  imports: [CommonModule, TableModule],
  templateUrl: './booking-summary.component.html',
  styleUrl: './booking-summary.component.scss'
})
export class BookingSummaryComponent {
  @Input() bookingData: BookingSummaryData = {};
  @Input() showTitle: boolean = true;
  @Input() compact: boolean = false;

  get summaryItems() {
    const items = [
      { label: 'Event', value: this.bookingData?.eventName || 'Event Not Available' },
      { label: 'Venue', value: this.bookingData?.venueName || 'Venue Not Available' },
      { label: 'Address', value: this.bookingData?.venueAddress || 'Address Not Available' },
      { label: 'Date', value: this.formatDate(this.bookingData?.showDate) },
      { label: 'Time', value: this.bookingData?.showTime || 'Time Not Available' },
      { label: 'Seats', value: (this.bookingData?.seats && this.bookingData.seats.length > 0) ? this.bookingData.seats.join(', ') : 'No Seats Selected' },
      { label: 'Number of Tickets', value: this.bookingData?.numTickets?.toString() || '0' },
      { label: 'Total Amount', value: (this.bookingData?.totalAmount !== undefined && this.bookingData?.totalAmount !== null) ? `₹${this.bookingData.totalAmount}` : '₹0' }
    ];

    if (this.bookingData?.bookingId) {
      items.unshift({ label: 'Booking ID', value: this.bookingData.bookingId });
    }

    return this.compact ? items.filter(item => 
      ['Total Amount', 'Booking ID', 'Number of Tickets'].includes(item.label)
    ) : items;
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString || dateString.trim() === '') return 'Date Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date Format Error';
    }
  }
}
