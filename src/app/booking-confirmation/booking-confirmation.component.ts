import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { interval, Subscription } from 'rxjs';
import { BookingSummaryComponent, BookingSummaryData } from '../shared/booking-summary/booking-summary.component';
import { BookingService } from '../services/bookings.service';

@Component({
  selector: 'app-booking-confirmation',
  imports: [CommonModule, ButtonModule, CardModule, BookingSummaryComponent],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss'
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  
  bookingData: BookingSummaryData = {};
  timeRemaining = 120; 
  timerSubscription?: Subscription;
  isProcessingPayment = false;
  showId: string = '';

  ngOnInit() {
    // First try to get from navigation state (for direct navigation)
    const navigation = this.router.getCurrentNavigation();
    console.log('Navigation object:', navigation);
    console.log('Navigation state:', navigation?.extras?.state);
    
    let bookingDataFound = false;
    
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      if (state['bookingData'] && state['showId']) {
        this.bookingData = state['bookingData'];
        this.showId = state['showId'];
        console.log('Booking data received from navigation state:', this.bookingData);
        console.log('Show ID received from navigation state:', this.showId);
        
        // Store in sessionStorage as backup for page refresh
        sessionStorage.setItem('bookingData', JSON.stringify(this.bookingData));
        sessionStorage.setItem('selectedShowId', this.showId);
        
        bookingDataFound = true;
      }
    } 
    
    // Fallback to sessionStorage (for page refresh)
    if (!bookingDataFound) {
      const storedData = sessionStorage.getItem('bookingData');
      const storedShowId = sessionStorage.getItem('selectedShowId');
      
      if (storedData && storedShowId) {
        try {
          this.bookingData = JSON.parse(storedData);
          this.showId = storedShowId;
          console.log('Booking data received from sessionStorage (fallback):', this.bookingData);
          console.log('Show ID received from sessionStorage (fallback):', this.showId);
          bookingDataFound = true;
        } catch (error) {
          console.error('Error parsing booking data from sessionStorage:', error);
        }
      }
    }
    
    if (bookingDataFound) {
      this.startTimer();
    } else {
      console.warn('No booking data or show ID found, redirecting to events');
      this.router.navigate(['/dashboard/events']);
      return;
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.timeExpired();
      }
    });
  }

  timeExpired() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
 
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('selectedShowId');
    this.router.navigate(['/dashboard/events']);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get timerColor(): string {
    if (this.timeRemaining <= 30) return '#f44336'; 
    if (this.timeRemaining <= 60) return '#ff9800'; 
    return '#4caf50'; // Green
  }

  onCancel() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    // Clear booking data when cancelled
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('selectedShowId');
    this.router.navigate(['/dashboard/events']);
  }

  onPay() {
    this.isProcessingPayment = true;
    
    const userId = localStorage.getItem('user_id');
    const seats = this.bookingData.seats || [];
    
    if (!userId || !this.showId || seats.length === 0) {
      console.error('Missing required data for booking');
      this.isProcessingPayment = false;
      return;
    }
    
    this.bookingService.addBooking(this.showId, seats, userId).subscribe({
      next: (response) => {
        console.log('Booking created successfully:', response);
        
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        
        // Store booking data with booking ID for payment success page
        const paymentData = {
          ...this.bookingData,
          bookingId: response.booking_id
        };
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
        
        // Clear booking data as it's no longer needed
        sessionStorage.removeItem('bookingData');
        sessionStorage.removeItem('selectedShowId');
        
        this.router.navigate(['/dashboard/payment-success']);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.isProcessingPayment = false;
        // Handle error - you might want to show an error message to user
      }
    });
  }
}
