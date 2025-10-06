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
  generatedBookingId = '';

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    let paymentDataFound = false;
    
    if (navigation?.extras.state && navigation.extras.state['bookingData']) {
      this.bookingData = { ...navigation.extras.state['bookingData'] };
      paymentDataFound = true;
    } else {
      const storedData = sessionStorage.getItem('paymentData');
      if (storedData) {
        try {
          this.bookingData = JSON.parse(storedData);
          paymentDataFound = true;
        } catch (error) {
          console.error('Error parsing payment data from sessionStorage:', error);
        }
      }
    }
    
    if (!paymentDataFound) {
      this.router.navigate(['/dashboard/events']);
      return;
    }

    this.generatedBookingId = this.generateBookingId();
    this.bookingData.bookingId = this.generatedBookingId;

    sessionStorage.removeItem('paymentData');

    this.refreshBookings();
  }

  private generateBookingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK${timestamp.slice(-6)}${random}`;
  }

  private refreshBookings() {
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {},
      error: (error) => {}
    });
  }

  goToHome() {
    this.router.navigate(['/dashboard/events']);
  }

  get successMessage(): string {
    return "Get ready for an amazing experience!";
  }
}
