import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Seat } from '../models/seats';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { BookingSummaryData } from '../shared/booking-summary/booking-summary.component';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ShowService } from '../show.service';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-seat-map',
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    SpinnerComponent,
  ],
  templateUrl: './seat-map.component.html',
  styleUrl: './seat-map.component.scss',
})
export class SeatMapComponent implements OnInit, OnChanges {
  private router = inject(Router);
  private auth = inject(AuthService);
  private showService = inject(ShowService);
  private messageService = inject(MessageService);
  isBlocking = false;

  role = this.auth.getRole();
  adminUserEmail = '';
  userNotFound = false;

  bookingSummary = `Total Number of Tickets Booked:   Total Sale:`;

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() show: any;
  @Input() price: number = 0;

  seats: Seat[] = [];

  ngOnInit() {
    if (this.show) {
      console.log(this.show);
      this.initializeSeats();
    }
    this.bookingSummary = `Total Number of Tickets Booked:${
      this.show?.BookedSeats.length
    }   Total Sale:₹${this.show?.BookedSeats.length * this.price}`;
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
    const rawBookedSeats: string[] =
      this.show?.BookedSeats || this.show?.booked_seats || [];

    const bookedSeats: string[] = rawBookedSeats.map((seat) =>
      seat.toLowerCase()
    );

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
          isSelected: false,
        });
      }
    }
  }

  getRowLetter(row: number): string {
    return String.fromCharCode(64 + row);
  }

  getSeat(row: number, col: number): Seat | undefined {
    return this.seats.find((s) => s.row === row && s.seat === col);
  }

  errorMessage: string = '';

  toggleSeat(row: number, seat: number) {
    if (this.role == 'Host') {
      return;
    }
    const seatObj = this.seats.find((s) => s.row === row && s.seat === seat);

    if (!seatObj || seatObj.isBooked) return;

    if (!seatObj.isSelected && this.selectedSeats.length >= 7) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Limit Reached',
        detail: 'You can only book up to 7 seats at once.',
        life: 3000,
      });
      return;
    }

    this.errorMessage = '';

    this.seats = this.seats.map((s) =>
      s.row === row && s.seat === seat && !s.isBooked
        ? { ...s, isSelected: !s.isSelected }
        : s
    );
  }
  get selectedSeats() {
    return this.seats.filter((s) => s.isSelected);
  }

  get selectedSeatCodes(): string[] {
    return this.selectedSeats.map(
      (s) => `${this.getRowLetter(s.row)}${s.seat}`
    );
  }

  get totalPrice() {
    return this.selectedSeats.length * this.price;
  }

  get isShowBlocked(): boolean {
    return !!(this.show?.IsBlocked ?? this.show?.is_blocked);
  }

  getSeatClass(seat: Seat) {
    if (!seat) return 'available';

    if (seat.isBooked) return 'booked';
    if (seat.isSelected) return 'selected';
    return 'available';
  }
  private bookingData: any;

  onClickConfirm() {
    this.bookingData = this.makeBookingData();
    if (!this.bookingData) return;

    const role = this.auth.getRole();

    if (role === 'Customer') {
      this.bookingData.userID = this.auth.getID();
      this.persistBookingContext(this.show?.ID || '');
      this.onConfirmBooking(this.bookingData);
    } else if (role === 'Admin') {
      const mailID = this.adminUserEmail.trim();
      if (!mailID) {
        this.errorMessage = 'Please enter a user email before confirming.';
        return;
      }

      this.bookingData.bookedForEmail = mailID;
      this.persistBookingContext(this.show?.ID || '');

      this.auth.getUserByMailID(mailID).subscribe({
        next: (user) => {
          if (!user) {
            this.userNotFound = true;
            return;
          }
          this.userNotFound = false;
          this.bookingData.userID = user.UserID;
          console.log(user.UserID);
          this.persistBookingContext(this.show?.ID || '');
          this.onConfirmBooking(this.bookingData);
        },
        error: () => {
          this.userNotFound = true;
        },
      });
    }
  }

  makeBookingData() {
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
    console.log(
      'seat selection stage: selected seats:',
      this.selectedSeatCodes
    );
    console.log('seat selection stage: total price:', this.totalPrice);

    const showDateFormatted = this.show?.ShowDate
      ? this.show.ShowDate instanceof Date
        ? this.show.ShowDate.toISOString()
        : this.show.ShowDate
      : '';

    const bookingData: BookingSummaryData = {
      eventName: this.show?.Event?.Name || 'Event Name Not Available',
      venueName: this.show?.Venue?.Name || 'Venue Name Not Available',
      venueAddress: venueAddress,
      showDate: showDateFormatted,
      showTime: this.show?.ShowTime || 'Time TBD',
      seats: [...this.selectedSeatCodes],
      numTickets: this.selectedSeats.length,
      totalAmount: this.totalPrice,
    };

    console.log('booking data creation stage: bookingData:', bookingData);
    console.log('booking data creation stage: showId:', this.show?.ID);

    this.bookingData = bookingData;
    this.persistBookingContext(this.show?.ID || '');
    this.onDialogHide();
    return bookingData;
  }

  onConfirmBooking(bookingData: any) {
    this.persistBookingContext(this.show?.ID || '');
    this.router.navigate(['/dashboard/booking-confirmation'], {
      state: {
        bookingData: bookingData,
        showId: this.show?.ID || '',
        showData: this.show,
      },
    });
    console.log(bookingData);
    console.log(
      'seat-map navigation stage: navigating to booking confirmation'
    );
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onBlockShow() {
    if (!this.show) return;

    const isCurrentlyBlocked =
      (this.show?.IsBlocked ?? this.show?.is_blocked) ?? false;
    const shouldBlock = !isCurrentlyBlocked;

    this.isBlocking = true;

    this.showService.blockShow(this.show.ID, shouldBlock).subscribe({
      next: (res) => {
        this.isBlocking = false;
        this.show.IsBlocked = shouldBlock;
        if ('is_blocked' in this.show) {
          this.show.is_blocked = shouldBlock;
        }

        this.messageService.add({
          severity: 'success',
          summary: shouldBlock ? 'Show Blocked' : 'Show Unblocked',
          detail: shouldBlock
            ? 'This show has been successfully blocked.'
            : 'This show is now active again.',
          life: 3000,
        });
      },
      error: (err) => {
        this.isBlocking = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Action Failed',
          detail: 'Something went wrong while updating the show.',
          life: 3000,
        });
      },
    });
  }

  private persistBookingContext(showId: string) {
    if (!this.bookingData) {
      return;
    }

    try {
      sessionStorage.setItem('bookingData', JSON.stringify(this.bookingData));
      sessionStorage.setItem('selectedShowId', showId);
      console.log('seat-map storage stage: booking context persisted');
    } catch (error) {
      console.error('seat-map storage stage: failed to persist booking context', error);
    }
  }
}
