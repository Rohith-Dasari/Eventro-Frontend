import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { EnrichedBooking } from '../models/bookings';
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
  @Input() booking: EnrichedBooking | null = null;
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
    const show = this.booking?.show_details as any;
    return show?.event?.name ?? show?.Event?.Name ?? 'Event Name Not Available';
  }

  get venueName(): string {
    const venue = this.getVenueDetails();
    return venue?.venue_name ?? venue?.Name ?? 'Venue Not Available';
  }

  get venueAddress(): string {
    const venue = this.getVenueDetails();
    const city = venue?.city ?? venue?.City ?? '';
    const state = venue?.state ?? venue?.State ?? '';
    if (city && state) return `${city}, ${state}`;
    return city || state || 'Address not available';
  }

  get showDate(): string | undefined {
    const show = this.booking?.show_details as any;
    const rawDate = show?.show_date ?? show?.ShowDate;
    if (!rawDate) return undefined;
    return rawDate instanceof Date ? rawDate.toISOString() : rawDate;
  }

  get showTime(): string {
    const show = this.booking?.show_details as any;
    return show?.show_time ?? show?.ShowTime ?? 'Time TBD';
  }

  private getVenueDetails(): any {
    const show = this.booking?.show_details as any;
    return show?.venue ?? show?.Venue ?? {};
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
