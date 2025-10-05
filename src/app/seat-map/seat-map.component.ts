import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Seat } from '../models/seats';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { BookingSummaryData } from '../shared/booking-summary/booking-summary.component';

@Component({
  selector: 'app-seat-map',
  imports: [DialogModule,CommonModule,FormsModule,ButtonModule],
  templateUrl: './seat-map.component.html',
  styleUrl: './seat-map.component.scss'
})
export class SeatMapComponent implements OnInit {
  private router = inject(Router);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>(); 

  @Input() show: any;      
  @Input() price: number = 0;

  seats: Seat[] = [];

  

  ngOnInit() {
    if (this.show) {
      this.initializeSeats();
    }
  }

  initializeSeats() {
    const bookedSeats: string[] = this.show?.BookedSeats || this.show?.booked_seats || [];
    console.log('Show object:', this.show);
    console.log('Booked seats from show:', bookedSeats);

    this.seats = [];
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 10; seat++) {
        const seatCode = `${this.getRowLetter(row)}${seat}`;
        const isBooked = bookedSeats.includes(seatCode);
        this.seats.push({
          row,
          seat,
          isBooked,
          isSelected: false
        });
      }
    }
  }

  getRowLetter(row: number): string {
    return String.fromCharCode(64 + row); 
  }

  getSeat(row: number, col: number): Seat | undefined {
    return this.seats.find(s => s.row === row && s.seat === col);
  }

errorMessage: string = '';

toggleSeat(row: number, seat: number) {
  const seatObj = this.seats.find(s => s.row === row && s.seat === seat);

  if (!seatObj || seatObj.isBooked) return;

  if (!seatObj.isSelected && this.selectedSeats.length >= 7) {
    this.errorMessage = 'You can only book up to 7 seats at once.';
    return;
  }

  this.errorMessage = ''; 

  this.seats = this.seats.map(s =>
    s.row === row && s.seat === seat && !s.isBooked
      ? { ...s, isSelected: !s.isSelected }
      : s
  );
}


  get selectedSeats() {
    return this.seats.filter(s => s.isSelected);
  }  

  get selectedSeatCodes(): string[] {
    return this.selectedSeats.map(
      s => `${this.getRowLetter(s.row)}${s.seat}`
    );
  }

  get totalPrice() {
    return this.selectedSeats.length * this.price;
  }

  getSeatClass(seat: Seat) {
    if (!seat) return 'available';
    
    if (seat.isBooked) return 'booked';
    if (seat.isSelected) return 'selected';
    return 'available';
  }

  onConfirmBooking() {
    if (this.selectedSeats.length === 0) {
      this.errorMessage = 'Please select at least one seat.';
      return;
    }

    const venueCity = this.show?.Venue?.City || '';
    const venueState = this.show?.Venue?.State || '';
    let venueAddress = '';
    if (venueCity && venueState) {
      venueAddress = `${venueCity}, ${venueState}`;
    } else if (venueCity) {
      venueAddress = venueCity;
    } else if (venueState) {
      venueAddress = venueState;
    } else {
      venueAddress = 'Address not available';
    }

    const bookingData: BookingSummaryData = {
      eventName: this.show?.Event?.Name || 'Event Name Not Available',
      venueName: this.show?.Venue?.Name || 'Venue Name Not Available',
      venueAddress: venueAddress,
      showDate: this.show?.ShowDate || '',
      showTime: this.show?.ShowTime || 'Time TBD',
      seats: [...this.selectedSeatCodes],
      numTickets: this.selectedSeats.length,
      totalAmount: this.totalPrice
    };

    console.log('Navigating to booking confirmation with data:', bookingData);

    this.onDialogHide();
    
    setTimeout(() => {
      this.router.navigate(['/dashboard/booking-confirmation'], {
        state: { bookingData: bookingData }
      });
    }, 100);
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}