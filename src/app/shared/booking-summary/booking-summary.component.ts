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
      { label: 'Event', value: this.bookingData.eventName || 'N/A' },
      { label: 'Venue', value: this.bookingData.venueName || 'N/A' },
      { label: 'Address', value: this.bookingData.venueAddress || 'N/A' },
      { label: 'Date', value: this.formatDate(this.bookingData.showDate) },
      { label: 'Time', value: this.bookingData.showTime || 'N/A' },
      { label: 'Seats', value: this.bookingData.seats?.join(', ') || 'N/A' },
      { label: 'Number of Tickets', value: this.bookingData.numTickets?.toString() || 'N/A' },
      { label: 'Total Amount', value: this.bookingData.totalAmount ? `₹${this.bookingData.totalAmount}` : 'N/A' }
    ];

    if (this.bookingData.bookingId) {
      items.unshift({ label: 'Booking ID', value: this.bookingData.bookingId });
    }

    return this.compact ? items.filter(item => 
      ['Total Amount', 'Booking ID', 'Number of Tickets'].includes(item.label)
    ) : items;
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }
}
