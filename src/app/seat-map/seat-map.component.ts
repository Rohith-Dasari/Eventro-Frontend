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

  bookingSummary = `Total Number of Tickets Booked: 0   Total Sale: ₹0`;

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
    this.updateBookingSummary();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.initializeSeats();
      this.updateBookingSummary();
    }

    if (changes['price']) {
      this.updateBookingSummary();
    }

    if (changes['visible'] && changes['visible'].currentValue) {
      this.errorMessage = '';
    }
  }

  initializeSeats() {
    const rawBookedSeats: string[] = this.getBookedSeats();

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
    return this.isShowCurrentlyBlocked();
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

    const venue = this.getVenueDetails();
    const venueCity = venue?.city ?? venue?.City ?? '';
    const venueState = venue?.state ?? venue?.State ?? '';
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

    const rawShowDate = this.getShowDateValue();
    const showDateFormatted = rawShowDate
      ? rawShowDate instanceof Date
        ? rawShowDate.toISOString()
        : rawShowDate
      : '';

    const bookingData: BookingSummaryData = {
      eventName: this.getEventName(),
      venueName: venue?.venue_name ?? venue?.Name ?? 'Venue Name Not Available',
      venueAddress: venueAddress,
      showDate: showDateFormatted,
      showTime: this.getShowTimeValue() || 'Time TBD',
      seats: [...this.selectedSeatCodes],
      numTickets: this.selectedSeats.length,
      totalAmount: this.totalPrice,
    };

    console.log('booking data creation stage: bookingData:', bookingData);
    console.log('booking data creation stage: showId:', this.getShowId());

    this.bookingData = bookingData;
    this.persistBookingContext(this.getShowId());
    this.onDialogHide();
    return bookingData;
  }

  onConfirmBooking(bookingData: any) {
    this.persistBookingContext(this.getShowId());
    this.router.navigate(['/dashboard/booking-confirmation'], {
      state: {
        bookingData: bookingData,
        showId: this.getShowId(),
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

    const isCurrentlyBlocked = this.isShowCurrentlyBlocked();
    const shouldBlock = !isCurrentlyBlocked;

    this.isBlocking = true;

    this.showService.blockShow(this.getShowId(), shouldBlock).subscribe({
      next: (res) => {
        this.isBlocking = false;
        if (this.show) {
          if ('IsBlocked' in this.show) {
            (this.show as any).IsBlocked = shouldBlock;
          }
          if ('is_blocked' in this.show) {
            (this.show as any).is_blocked = shouldBlock;
          }
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
      console.error(
        'seat-map storage stage: failed to persist booking context',
        error
      );
    }
  }

  private getBookedSeats(): string[] {
    const seats = (this.show as any)?.booked_seats ?? (this.show as any)?.BookedSeats ?? [];
    return Array.isArray(seats) ? seats : [];
  }

  get bookedSeatsCount(): number {
    return this.getBookedSeats().length;
  }

  private updateBookingSummary() {
    this.bookingSummary = `Total Number of Tickets Booked: ${
      this.bookedSeatsCount
    }   Total Sale: ₹${this.bookedSeatsCount * this.price}`;
  }

  private getShowId(): string {
    return (this.show as any)?.id ?? (this.show as any)?.ID ?? '';
  }

  private getVenueDetails(): any {
    return (this.show as any)?.venue ?? (this.show as any)?.Venue ?? {};
  }

  private getShowDateValue(): string | Date | undefined {
    return (this.show as any)?.show_date ?? (this.show as any)?.ShowDate;
  }

  private getShowTimeValue(): string | undefined {
    return (this.show as any)?.show_time ?? (this.show as any)?.ShowTime;
  }

  private getEventName(): string {
    const event = (this.show as any)?.event ?? (this.show as any)?.Event;
    return event?.name ?? event?.Name ?? 'Event Name Not Available';
  }

  private isShowCurrentlyBlocked(): boolean {
    return !!((this.show as any)?.is_blocked ?? (this.show as any)?.IsBlocked);
  }
}
