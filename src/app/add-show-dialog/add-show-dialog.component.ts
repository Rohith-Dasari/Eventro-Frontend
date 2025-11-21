import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
import { MessageService } from 'primeng/api';

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
  @ViewChild('addShowForm') addShowForm?: NgForm;

  private showService = inject(ShowService);
  private venueService = inject(VenueService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  constructor(private datePipe: DatePipe){}

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
    this.addShowForm?.resetForm();
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
        this.venues = data
        .filter((v) => !v.IsBlocked)
        .map((v) => ({ id: v.ID, name: v.Name }));
      },
      error: (err) => console.error('Error loading venues:', err),
    });
  }

  submit(form: NgForm) {
    if (!this.eventID) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Event',
        detail: 'Could not determine the event to host a show for.',
        life: 3000,
      });
      return;
    }

    if (form.invalid || !this.selectedDate || !this.newShow.price || this.newShow.price <= 0) {
      if (this.newShow.price === null || this.newShow.price === undefined) {
        form.controls['price']?.setErrors({ required: true });
      } else if (this.newShow.price <= 0) {
        form.controls['price']?.setErrors({ min: true });
      }
      form.form.markAllAsTouched();
      return;
    }

    const datePart = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd')!;
    const timePart = this.datePipe.transform(this.selectedDate, 'HH:mm')!;

    console.log([datePart,timePart]);

    this.newShow.event_id = this.eventID;
    this.newShow.show_date = datePart;
    this.newShow.show_time = timePart;

    this.showService.addShow(this.newShow).subscribe({
      next: (res) => {
        console.log('Show added successfully:', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Show Added',
          detail: 'Your show has been scheduled successfully.',
          life: 3000,
        });
        this.showAdded.emit();
        this.close();
      },
      error: (err) => {
        console.error('Error adding show:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: 'We could not schedule this show. Please try again.',
          life: 3000,
        });
      },
    });
  }
}
