import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { EnrichedBooking } from '../models/bookings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upcoming-booking-details',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
  templateUrl: './upcoming-booking-details.component.html',
  styleUrl: './upcoming-booking-details.component.scss'
})
export class UpcomingBookingDetailsComponent {
  @Input() visible: boolean = false;
  @Input() booking: EnrichedBooking | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  }
}
