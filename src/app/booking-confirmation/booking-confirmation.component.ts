import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { interval, Subscription } from 'rxjs';
import { BookingSummaryComponent, BookingSummaryData } from '../shared/booking-summary/booking-summary.component';

@Component({
  selector: 'app-booking-confirmation',
  imports: [CommonModule, ButtonModule, CardModule, BookingSummaryComponent],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss'
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  bookingData: BookingSummaryData = {};
  timeRemaining = 120; 
  timerSubscription?: Subscription;
  isProcessingPayment = false;

  ngOnInit() {
    // First try to get from navigation state (for immediate navigation)
    const navigation = this.router.getCurrentNavigation();
    console.log('Navigation object:', navigation);
    console.log('Navigation state:', navigation?.extras?.state);
    
    let bookingDataFound = false;
    
    if (navigation?.extras?.state && navigation.extras.state['bookingData']) {
      this.bookingData = navigation.extras.state['bookingData'];
      console.log('Booking data received from navigation state:', this.bookingData);
      bookingDataFound = true;
    } else {
      // Try to get from sessionStorage (for page refresh or delayed navigation)
      const storedData = sessionStorage.getItem('bookingData');
      if (storedData) {
        try {
          this.bookingData = JSON.parse(storedData);
          console.log('Booking data received from sessionStorage:', this.bookingData);
          bookingDataFound = true;
        } catch (error) {
          console.error('Error parsing booking data from sessionStorage:', error);
        }
      }
    }
    
    if (bookingDataFound) {
      this.startTimer();
    } else {
      console.warn('No booking data found, redirecting to events');
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
    this.router.navigate(['/dashboard/events']);
  }

  onPay() {
    this.isProcessingPayment = true;
    
    setTimeout(() => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      
      // Store booking data for payment success page
      sessionStorage.setItem('paymentData', JSON.stringify(this.bookingData));
      // Clear booking data as it's no longer needed
      sessionStorage.removeItem('bookingData');
      
      this.router.navigate(['/dashboard/payment-success']);
    }, 2000);
  }
}
