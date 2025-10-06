import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { interval, Subscription } from 'rxjs';
import { BookingSummaryComponent, BookingSummaryData } from '../shared/booking-summary/booking-summary.component';
import { BookingService } from '../services/bookings.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

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
  private authService= inject(AuthService);
  bookingData: BookingSummaryData = {};
  timeRemaining = 120; 
  timerSubscription?: Subscription;
  isProcessingPayment = false;
  showId: string = '';

  ngOnInit() {
    console.log('ngOnInit stage: history.state:', history.state);
    let bookingDataFound = false;
    
    if (history.state?.bookingData && history.state?.showId) {
      this.bookingData = history.state.bookingData;
      this.showId = history.state.showId;
      console.log('history.state stage: bookingData:', this.bookingData);
      console.log('history.state stage: showId:', this.showId);
      
      sessionStorage.setItem('bookingData', JSON.stringify(this.bookingData));
      sessionStorage.setItem('selectedShowId', this.showId);
      console.log('sessionStorage store stage: data stored');
      
      bookingDataFound = true;
    }
    
    if (!bookingDataFound) {
      const storedData = sessionStorage.getItem('bookingData');
      const storedShowId = sessionStorage.getItem('selectedShowId');
      console.log('sessionStorage fallback stage: storedData:', storedData);
      console.log('sessionStorage fallback stage: storedShowId:', storedShowId);
      
      if (storedData && storedShowId) {
        try {
          this.bookingData = JSON.parse(storedData);
          this.showId = storedShowId;
          console.log('sessionStorage parse stage: bookingData:', this.bookingData);
          console.log('sessionStorage parse stage: showId:', this.showId);
          bookingDataFound = true;
        } catch (error) {
          console.error('sessionStorage parse error stage:', error);
        }
      }
    }
    
    if (bookingDataFound) {
      console.log('timer start stage: starting timer');
      this.startTimer();
    } else {
      console.log('redirect stage: no data found, redirecting');
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
    console.log('timeExpired stage: timer expired');
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
 
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('selectedShowId');
    console.log('cleanup stage: sessionStorage cleared');
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
    console.log('onCancel stage: user cancelled booking');
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('selectedShowId');
    console.log('cancel cleanup stage: sessionStorage cleared');
    this.router.navigate(['/dashboard/events']);
  }

  onPay() {
    console.log('onPay stage: payment initiated');
    this.isProcessingPayment = true;
   
    const userId = (this.authService.userSignal() as User).user_id;
    const seats = this.bookingData.seats || [];
    console.log('payment validation stage: userId:', userId);
    console.log('payment validation stage: showId:', this.showId);
    console.log('payment validation stage: seats:', seats);
    
    if (!userId || !this.showId || seats.length === 0) {
      console.log('payment validation failed stage: missing data');
      this.isProcessingPayment = false;
      return;
    }
    
    console.log('API call stage: calling addBooking');
    this.bookingService.addBooking(this.showId, seats, userId).subscribe({
      next: (response) => {
        console.log('API success stage: response:', response);
        
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        
        const paymentData = {
          ...this.bookingData,
          bookingId: response.booking_id
        };
        console.log('payment data stage: paymentData:', paymentData);
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
        
        sessionStorage.removeItem('bookingData');
        sessionStorage.removeItem('selectedShowId');
        console.log('payment cleanup stage: old data cleared');
        
        this.router.navigate(['/dashboard/payment-success']);
      },
      error: (error) => {
        console.log('API error stage: error:', error);
        this.isProcessingPayment = false;
      }
    });
  }
}
