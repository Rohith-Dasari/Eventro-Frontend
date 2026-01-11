import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { EventService } from '../../services/event.service';
import { MessageService } from 'primeng/api';
import { CreateEventRequest } from '../../models/events';

@Component({
  selector: 'app-add-event-dialog',
  imports: [CommonModule,FormsModule,DialogModule,InputTextModule,InputTextarea,DropdownModule,ButtonModule],
  templateUrl: './add-event-dialog.component.html',
  styleUrl: './add-event-dialog.component.scss'
})
export class AddEventDialogComponent {
@Output() eventAdded = new EventEmitter<void>();

  @ViewChild('addEventForm') addEventForm?: NgForm;

  visible = false;

  newEvent: CreateEventRequest = {
    name: '',
    description: '',
    duration: 0,
    category: '',
    artist_ids: ['d4ded874-ffd1-435a-8dc3-6b2ca0f216cf']
  };

  durationInt: number | null = null;

  categories = [
    { label: 'Movie', value: 'movie' },
    { label: 'Sports', value: 'sports' },
    { label: 'Concert', value: 'concert' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Party', value: 'party' }
  ];

  constructor(
    private eventService: EventService,
    private messageService: MessageService
  ) {}

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.addEventForm?.resetForm();
    this.resetForm();
  }

  resetForm() {
    this.newEvent = {
      name: '',
      description: '',
      duration: 0,
      category: '',
      artist_ids: ['d4ded874-ffd1-435a-8dc3-6b2ca0f216cf']
    };
    this.durationInt = null;
  }

  submit(form: NgForm) {
    if (form.invalid || this.durationInt === null || this.durationInt <= 0) {
      form.form.markAllAsTouched();
      return;
    }

    const trimmedName = this.newEvent.name.trim();
    const trimmedDescription = this.newEvent.description.trim();

    this.newEvent.name = trimmedName;
    this.newEvent.description = trimmedDescription;

    if (!this.newEvent.name || !this.newEvent.description || !this.newEvent.category) {
      form.form.markAllAsTouched();
      return;
    }

    const payload: CreateEventRequest = {
      ...this.newEvent,
      duration: this.durationInt as number,
    };

    const eventName = this.newEvent.name;

    this.eventService.addEvent(payload).subscribe({
      next: (res) => {
        console.log('Event added successfully:', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Event Created',
          detail: `${eventName} has been added successfully.`,
          life: 3000,
        });
        this.close();
        this.eventAdded.emit(); 
      },
      error: (err) => {
        console.error('Error adding event:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Creation Failed',
          detail: 'We could not add the event. Please try again.',
          life: 3000,
        });
      }
    });
  }

}
