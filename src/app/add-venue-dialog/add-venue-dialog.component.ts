import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { VenueService } from '../services/venue.service';
import { createVenue } from '../models/venues';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-venue-dialog',
  imports: [CommonModule,FormsModule,DialogModule,InputTextModule,ButtonModule],
  templateUrl: './add-venue-dialog.component.html',
  styleUrl: './add-venue-dialog.component.scss'
})
export class AddVenueDialogComponent {
  @Output() venueAdded = new EventEmitter<void>();
  @ViewChild('addVenueForm') addVenueForm?: NgForm;

  private venueService = inject(VenueService);
  private messageService = inject(MessageService);

  visible = false;

  newVenue: createVenue = {
    name: '',
    city: '',
    state: '',
    isSeatLayoutRequired: true,
  };

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.addVenueForm?.resetForm();
    this.resetForm();
  }

  resetForm() {
    this.newVenue = {
      name: '',
      city: '',
      state: '',
      isSeatLayoutRequired: true,
    };
  }

  submit(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    const trimmedName = this.newVenue.name.trim();
    const trimmedCity = this.newVenue.city.trim();
    const trimmedState = this.newVenue.state.trim();

    this.newVenue.name = trimmedName;
    this.newVenue.city = trimmedCity;
    this.newVenue.state = trimmedState;

    if (!this.newVenue.name || !this.newVenue.city || !this.newVenue.state) {
      form.form.markAllAsTouched();
      return;
    }

    const payload: createVenue = { ...this.newVenue };
    const venueName = this.newVenue.name;

    this.venueService.addVenue(payload).subscribe({
      next: (res) => {
        console.log('Venue added successfully:', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Venue Created',
          detail: `${venueName} has been added successfully.`,
          life: 3000,
        });
        this.close();
        this.venueAdded.emit(); 
      },
      error: (err) => {
        console.error('Error adding venue:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: 'We could not add the venue. Please try again.',
          life: 3000,
        });
      }
    });
  }

}
