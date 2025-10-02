import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Seat } from '../models/seats';

@Component({
  selector: 'app-seat-map',
  imports: [DialogModule,CommonModule,FormsModule],
  templateUrl: './seat-map.component.html',
  styleUrl: './seat-map.component.scss'
})
export class SeatMapComponent implements OnInit {
@Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();   // 🔹 needed for [(visible)]

  @Input() show: any;      
  @Input() price: number = 0;

  seats: Seat[] = [];

  ngOnInit() {
    if (this.show) {
      this.initializeSeats();
    }
  }

  initializeSeats() {
    const bookedSeats: string[] = this.show?.BookedSeats || [];

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

  toggleSeat(row: number, seat: number) {
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
    if (seat.isBooked) return 'booked';
    if (seat.isSelected) return 'selected';
    return 'available';
  }

  onConfirmBooking(){
    console.log('clicked booking confirmed');
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}