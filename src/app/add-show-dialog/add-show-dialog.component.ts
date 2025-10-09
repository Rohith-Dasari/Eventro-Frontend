import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ShowService } from '../show.service';
import { CreateShow } from '../models/shows';
import { VenueService } from '../services/venue.service';
import { AuthService } from '../services/auth.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-add-show-dialog',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    DropdownModule,
  ],
  templateUrl: './add-show-dialog.component.html',
  styleUrl: './add-show-dialog.component.scss',
})
export class AddShowDialogComponent {
  @Input() eventID = '';
  @Output() showAdded = new EventEmitter<void>();

  private showService = inject(ShowService);
  private venueService = inject(VenueService);
  private authService = inject(AuthService);

  minDate = new Date();

  visible = false;
  venues: { id: string; name: string }[] = [];
                
  selectedDate: Date | null = null;

  newShow: CreateShow = {
    venue_id: '',
    event_id: '',
    show_date: '',
    show_time: '',
    price: 0,
  };

  open() {
    this.visible = true;
    this.loadVenues();
  }

  close() {
    this.visible = false;
    this.resetForm();
  }

  resetForm() {
    this.selectedDate = null;
    this.newShow = {
      event_id: '',
      venue_id: '',
      show_date: '',
      show_time: '',
      price: 0,
    };
  }

  loadVenues() {
    const hostId = this.authService.getID();
    if (!hostId) return;

    this.venueService.getVenues(hostId).subscribe({
      next: (data) => {
        this.venues = data.map((v) => ({ id: v.ID, name: v.Name }));
      },
      error: (err) => console.error('Error loading venues:', err),
    });
  }

  submit() {
    if (!this.eventID || !this.selectedDate) return;

    const dateISO = this.selectedDate.toISOString();
    const [datePart, timePart] = dateISO.split('T');

    this.newShow.event_id = this.eventID;
    this.newShow.show_date = datePart;
    this.newShow.show_time = timePart.slice(0, 5);

    this.showService.addShow(this.newShow).subscribe({
      next: (res) => {
        console.log('Show added successfully:', res);
        this.showAdded.emit();
        this.close();
      },
      error: (err) => {
        console.error('Error adding show:', err);
      },
    });
  }
}
