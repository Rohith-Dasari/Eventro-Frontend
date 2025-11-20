import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BookingService } from '../services/bookings.service';
import { EnrichedBooking } from '../models/bookings';
import { UpcomingBookingDetailsComponent } from '../upcoming-booking-details/upcoming-booking-details.component';

@Component({
  selector: 'app-bookings-list',
  imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, UpcomingBookingDetailsComponent],
  templateUrl: './bookings-list.component.html',
  styleUrl: './bookings-list.component.scss'
})

export class BookingsListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private location = inject(Location);

  bookings: EnrichedBooking[] = [];
  loading = true;
  selectedBooking: EnrichedBooking | null = null;
  dialogVisible = false;
  defaultImage = './images/hp3.jpg';

  ngOnInit() {
    console.log('bookings-list stage: component initialized');
    this.loadBookings();
  }

  loadBookings() {
    console.log('bookings-list stage: starting to load bookings');
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        console.log('bookings-list stage: raw bookings data received:', data);
        console.log('bookings-list stage: bookings count:', data.length);
        
        const now = new Date();

        const upcomingBookings = data.filter((booking) => {
          const showDateValue = this.getShowDateRaw(booking);
          if (!showDateValue) {
            console.log('bookings-list stage: booking missing show_date, excluding from upcoming list.', booking);
            return false;
          }

          const showDate = showDateValue instanceof Date ? showDateValue : new Date(showDateValue);
          const isValidDate = !Number.isNaN(showDate.getTime());

          if (!isValidDate) {
            console.log('bookings-list stage: invalid ShowDate encountered, excluding booking.', booking);
            return false;
          }

          const isUpcoming = showDate.getTime() >= now.getTime();
          if (!isUpcoming) {
            console.log('bookings-list stage: filtering out past booking with show_date:', showDateValue);
          }
          return isUpcoming;
        });

        this.bookings = upcomingBookings.sort((a, b) => {
          const dateAValue = this.getShowDateRaw(a);
          const dateBValue = this.getShowDateRaw(b);
          const dateA = dateAValue
            ? (dateAValue instanceof Date ? dateAValue : new Date(dateAValue)).getTime()
            : Number.MAX_SAFE_INTEGER;
          const dateB = dateBValue
            ? (dateBValue instanceof Date ? dateBValue : new Date(dateBValue)).getTime()
            : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });
        
        console.log('bookings-list stage: bookings after sorting:', this.bookings);
        console.log('bookings-list stage: setting loading to false');
        this.loading = false;
      },
      error: (err) => {
        console.error('bookings-list stage: API error occurred:', err);
        console.log('bookings-list stage: setting loading to false due to error');
        this.loading = false;
      }
    });
  }

  onBookingClick(booking: EnrichedBooking) {
    console.log('bookings-list stage: booking card clicked');
    console.log('bookings-list stage: selected booking data:', booking);
    this.selectedBooking = booking;
    this.dialogVisible = true;
    console.log('bookings-list stage: dialog visibility set to true');
  }

  onDialogHide() {
    console.log('bookings-list stage: dialog hide event triggered');
    this.dialogVisible = false;
    this.selectedBooking = null;
    console.log('bookings-list stage: dialog closed and selection cleared');
  }

  goBack() {
    console.log('bookings-list stage: back button clicked');
    console.log('bookings-list stage: navigating back to previous page');
    this.location.back();
  }

  formatDate(dateInput: string | Date | undefined): string {
    console.log('bookings-list stage: formatting date:', dateInput);
    if (!dateInput) {
      console.log('bookings-list stage: no date provided, returning TBD');
      return 'Date TBD';
    }
    try {
      const dateValue =
        dateInput instanceof Date ? dateInput : new Date(dateInput);
      const formatted = dateValue.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      console.log('bookings-list stage: date formatted successfully:', formatted);
      return formatted;
    } catch {
      console.log('bookings-list stage: date formatting failed, returning TBD');
      return 'Date TBD';
    }
  }

  getEventName(booking: EnrichedBooking): string {
    const show = booking.show_details as any;
    return show?.event?.name ?? show?.Event?.Name ?? 'Event Name Not Available';
  }

  getVenueName(booking: EnrichedBooking): string {
    const venue = this.getVenue(booking);
    return venue?.venue_name ?? venue?.Name ?? 'Venue Not Available';
  }

  getVenueCity(booking: EnrichedBooking): string {
    const venue = this.getVenue(booking);
    return venue?.city ?? venue?.City ?? '';
  }

  getShowTimeDisplay(booking: EnrichedBooking): string {
    const show = booking.show_details as any;
    return show?.show_time ?? show?.ShowTime ?? 'Time TBD';
  }

  getShowDateRaw(booking: EnrichedBooking): string | Date | undefined {
    const show = booking.show_details as any;
    return show?.show_date ?? show?.ShowDate;
  }

  private getVenue(booking: EnrichedBooking): any {
    const show = booking.show_details as any;
    return show?.venue ?? show?.Venue;
  }
}
