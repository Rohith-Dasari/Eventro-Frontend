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
  timeRemaining = 120; // 2 minutes in seconds
  timerSubscription?: Subscription;
  isProcessingPayment = false;

  ngOnInit() {
    // Get booking data from navigation state or route params
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.bookingData = navigation.extras.state['bookingData'];
    }
    
    // If no data, try to get from query params (fallback)
    this.route.queryParams.subscribe(params => {
      if (!this.bookingData.eventName && params['eventName']) {
        this.bookingData = {
          eventName: params['eventName'],
          venueName: params['venueName'],
          venueAddress: params['venueAddress'],
          showDate: params['showDate'],
          showTime: params['showTime'],
          seats: params['seats']?.split(',') || [],
          numTickets: parseInt(params['numTickets']) || 0,
          totalAmount: parseFloat(params['totalAmount']) || 0
        };
      }
    });

    this.startTimer();
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
    // Redirect back to events or show timeout message
    this.router.navigate(['/dashboard/events']);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get timerColor(): string {
    if (this.timeRemaining <= 30) return '#f44336'; // Red
    if (this.timeRemaining <= 60) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  }

  onCancel() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.router.navigate(['/dashboard/events']);
  }

  onPay() {
    this.isProcessingPayment = true;
    
    // Simulate payment processing
    setTimeout(() => {
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      
      // Navigate to payment success with booking data
      this.router.navigate(['/dashboard/payment-success'], {
        state: { bookingData: this.bookingData }
      });
    }, 2000); // 2 second delay to simulate processing
  }
}
