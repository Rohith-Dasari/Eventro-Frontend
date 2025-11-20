import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Booking } from '../models/bookings';
import { CommonModule } from '@angular/common';
import { BookingUtilsService } from '../services/booking-utils.service';

@Component({
  selector: 'app-upcoming-booking-details',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
  templateUrl: './upcoming-booking-details.component.html',
  styleUrl: './upcoming-booking-details.component.scss'
})
export class UpcomingBookingDetailsComponent {
  @Input() visible: boolean = false;
  @Input() booking: Booking | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  isGeneratingPDF: boolean = false;
  
  private bookingUtils = inject(BookingUtilsService);

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  formatDate(dateString: string | undefined): string {
    return this.bookingUtils.formatDate(dateString);
  }

  get eventName(): string {
    return this.booking?.event_name ?? 'Event Name Not Available';
  }

  get venueName(): string {
    return this.booking?.venue_name ?? 'Venue Not Available';
  }

  get venueAddress(): string {
    const city = this.booking?.venue_city ?? '';
    const state = this.booking?.venue_state ?? '';
    if (city && state) {
      return `${city}, ${state}`;
    }
    return city || state || 'Address not available';
  }

  get showDate(): string | undefined {
    return this.booking?.booking_date;
  }

  get showTime(): string {
    return this.booking ? this.bookingUtils.formatTime(this.booking.booking_date) : 'Time TBD';
  }

  async downloadTicketPDF() {
    if (!this.booking) return;

    this.isGeneratingPDF = true;

    try {
      await this.bookingUtils.downloadTicketPDF(this.booking);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.isGeneratingPDF = false;
    }
  }
}
