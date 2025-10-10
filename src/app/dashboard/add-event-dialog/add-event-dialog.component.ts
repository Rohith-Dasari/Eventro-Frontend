import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-add-event-dialog',
  imports: [CommonModule,FormsModule,DialogModule,InputTextModule,DropdownModule,ButtonModule],
  templateUrl: './add-event-dialog.component.html',
  styleUrl: './add-event-dialog.component.scss'
})
export class AddEventDialogComponent {
@Output() eventAdded = new EventEmitter<void>();

  visible = false;

  newEvent = {
    name: '',
    description: '',
    duration:'',
    category: '',
    artists: ["7c234a3c-49bd-486d-99c6-b2120aa2c21c"]
  };

  durationInt?:number;
  categoryObject!:{value:'', label:''};

  categories = [
    { label: 'Movie', value: 'movie' },
    { label: 'Sports', value: 'sports' },
    { label: 'Concert', value: 'concert' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Party', value: 'party' }
  ];

  constructor(private eventService: EventService) {}

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.resetForm();
  }

  resetForm() {
    this.newEvent = { name: '', description: '', duration: '', category: '', artists: ["7c234a3c-49bd-486d-99c6-b2120aa2c21c", "859478ed-0184-4053-823a-ed130e7cee99"]};
  }

  submit() {
    if (!this.newEvent.name || !this.newEvent.description) {
      return;
    }
    this.newEvent.duration=this.transform(this.durationInt as number);
    this.newEvent.category=this.categoryObject.value;

    this.eventService.addEvent(this.newEvent).subscribe({
      next: (res) => {
        console.log('Event added successfully:', res);
        this.close();
        this.eventAdded.emit(); 
      },
      error: (err) => {
        console.error('Error adding event:', err);
      }
    });
  }

  transform(minutes:number): string {
    if (minutes === null || minutes === undefined) {
      return '';
    }
    const decimalHours = minutes / 60;
    return `${decimalHours.toFixed(1)}h`;
  }
}
