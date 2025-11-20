import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/bookings.service';
import { Router } from '@angular/router';
import { Booking } from '../models/bookings';

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  bookings: Booking[] = [];
  upcomingCount: number = 0;
  loading = true;

  ngOnInit() {
    console.log('my-bookings stage: component initialized');
    this.loadBookingsCount();
  }

  loadBookingsCount() {
    console.log('my-bookings stage: loading bookings count');
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        console.log('my-bookings stage: bookings received:', bookings);
        this.bookings = bookings;
        const now = new Date();

        this.upcomingCount = bookings.filter(b => {
          if (!b.booking_date) {
            return false;
          }
          const showDate = new Date(b.booking_date);
          if (Number.isNaN(showDate.getTime())) {
            return false;
          }
          return showDate > now;
        }).length;
        
        console.log('my-bookings stage: upcoming count calculated:', this.upcomingCount);
        this.loading = false;
      },
      error: (err) => {
        console.error('my-bookings stage: error fetching bookings:', err);
        this.loading = false;
      }
    });
  }

  openBookingsList() {
    console.log('my-bookings stage: navigating to bookings list');
    this.router.navigate(['/dashboard/bookings']);
  }
}
