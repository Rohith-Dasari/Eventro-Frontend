import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BookingSummaryComponent, BookingSummaryData } from '../shared/booking-summary/booking-summary.component';
import { BookingService } from '../services/bookings.service';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, ButtonModule, CardModule, BookingSummaryComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit {
  private router = inject(Router);
  private bookingService = inject(BookingService);
  
  bookingData: BookingSummaryData = {};
  showAnimation = false;
  generatedBookingId = '';

  ngOnInit() {
    // Get booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.bookingData = navigation.extras.state['bookingData'];
    }

    // Generate a mock booking ID (in real app, this would come from API)
    this.generatedBookingId = this.generateBookingId();
    this.bookingData.bookingId = this.generatedBookingId;

    // Start success animation
    setTimeout(() => {
      this.showAnimation = true;
    }, 100);

    // Auto-refresh bookings in the background
    this.refreshBookings();
  }

  private generateBookingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK${timestamp.slice(-6)}${random}`;
  }

  private refreshBookings() {
    // Trigger a refresh of bookings data
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        console.log('Bookings refreshed after payment:', bookings);
      },
      error: (error) => {
        console.error('Error refreshing bookings:', error);
      }
    });
  }

  goToHome() {
    this.router.navigate(['/dashboard/events']);
  }

  // Positive affirmations array
  get successMessage(): string {
    const messages = [
      "🎉 Booking Confirmed! Get ready for an amazing experience!",
      "✨ Success! Your tickets are secured. Can't wait to see you there!",
      "🎊 Fantastic! Your booking is complete. The event awaits you!",
      "🌟 Wonderful! Your seats are reserved. Enjoy the show!",
      "🎭 Perfect! Your tickets are confirmed. Prepare for an unforgettable time!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
