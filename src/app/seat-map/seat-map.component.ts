import { Component, EventEmitter, OnInit, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
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
export class SeatMapComponent implements OnInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.initializeSeats();
    }
    
    if (changes['visible'] && changes['visible'].currentValue) {
      this.errorMessage = '';
    }
  }

  initializeSeats() {
    const rawBookedSeats: string[] = this.show?.BookedSeats || this.show?.booked_seats || [];
    
    const bookedSeats: string[] = rawBookedSeats.map(seat => seat.toLowerCase());
    
    console.log('Show object:', this.show);
    console.log('Raw booked seats from show:', rawBookedSeats);
    console.log('Normalized booked seats (lowercase):', bookedSeats);

    this.seats = [];
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 10; seat++) {
        const seatCode = `${this.getRowLetter(row)}${seat}`;
        const seatCodeLower = seatCode.toLowerCase();
        const isBooked = bookedSeats.includes(seatCodeLower);
        
        this.seats.push({
          row,
          seat,
          isBooked,
          isSelected: false
        });
      }
    }
    
    console.log('Total seats created:', this.seats.length);
    console.log('Booked seats count:', this.seats.filter(s => s.isBooked).length);
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

    console.log('seat selection stage: show data:', this.show);
    console.log('seat selection stage: selected seats:', this.selectedSeatCodes);
    console.log('seat selection stage: total price:', this.totalPrice);
    
    const showDateFormatted = this.show?.ShowDate ? 
      (this.show.ShowDate instanceof Date ? this.show.ShowDate.toISOString() : this.show.ShowDate) : '';
    
    const bookingData: BookingSummaryData = {
      eventName: this.show?.Event?.Name || 'Event Name Not Available',
      venueName: this.show?.Venue?.Name || 'Venue Name Not Available',
      venueAddress: venueAddress,
      showDate: showDateFormatted,
      showTime: this.show?.ShowTime || 'Time TBD',
      seats: [...this.selectedSeatCodes],
      numTickets: this.selectedSeats.length,
      totalAmount: this.totalPrice
    };

    console.log('booking data creation stage: bookingData:', bookingData);
    console.log('booking data creation stage: showId:', this.show?.ID);

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    sessionStorage.setItem('selectedShowId', this.show?.ID || '');
    console.log('seat-map storage stage: data stored in sessionStorage');

    this.onDialogHide();
    
    this.router.navigate(['/dashboard/booking-confirmation'], {
      state: {
        bookingData: bookingData,
        showId: this.show?.ID || '',
        showData: this.show
      }
    });
    console.log('seat-map navigation stage: navigating to booking confirmation');
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}