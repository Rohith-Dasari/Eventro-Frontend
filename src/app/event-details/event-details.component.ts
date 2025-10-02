import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { Shows } from '../models/shows';
import { Event } from '../models/events';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ShowsComponent } from '../shows/shows.component';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, ButtonModule, DatePipe, SliderModule, FormsModule, ShowsComponent],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})


export class EventDetailsComponent implements OnInit {
  event!: Event;
  shows: Shows[] = [];
  availableDates: Date[] = [];
  selectedDate!: Date;
  rangeValues: number[] = [0, 500];
  refreshing = false;
  private eventService = inject(EventService);

  ngOnInit(): void {
    this.event = history.state?.selectedEvent;
    if (!this.event) {
      console.error('No event info available.');
      return;
    }
    this.loadEvent(this.event.id);
  }

  loadEvent(eventId: string) {
    this.eventService.getShows(eventId).subscribe((shows: any[]) => {
      this.shows = shows;

      if (!shows.length) return;

      const firstDate = new Date(shows[0].ShowDate);
      this.availableDates = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(firstDate);
        d.setDate(d.getDate() + i);
        return d;
      });

      this.selectedDate = this.availableDates[0];
    });
  }

  selectDate(date: Date) {
    this.selectedDate = date;
  }

  refreshShows() {
    this.refreshing = true;
    this.eventService.getShows(this.event.id).subscribe((shows: Shows[]) => {
      this.shows = shows;
      this.refreshing = false; 
    });
  }
}