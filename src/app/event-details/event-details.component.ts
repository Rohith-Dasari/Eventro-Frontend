import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { forkJoin } from 'rxjs';
import { Shows } from '../models/shows';
import {Venues } from '../models/venues';
import { Event } from '../models/events';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-event-details',
  imports: [CommonModule, ButtonModule,DatePipe],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})


export class EventDetailsComponent implements OnInit {
  event!: Event; 
  shows: any[] = [];
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  venues: { name: string; shows: { id: string; time: string; price: number }[] }[] = [];
  selectedShow: Shows | null = null;

  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);

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

      // generate next 5 days from first show
      const firstDate = new Date(shows[0].ShowDate);
      this.availableDates = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(firstDate);
        d.setDate(d.getDate() + i);
        return d;
      });

      this.selectedDate = this.availableDates[0];
      this.loadVenues(this.selectedDate);
    });
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.loadVenues(date);
  }

  loadVenues(date: Date | null) {
    if (!date) return;

    const showsForDate = this.shows.filter(
      s => new Date(s.ShowDate).toDateString() === date.toDateString()
    );

    const groupedByVenue: { [venueId: string]: { name: string; shows: { id: string; time: string; price: number }[] } } = {};

    showsForDate.forEach(show => {
      if (!groupedByVenue[show.Venue.ID]) {
        groupedByVenue[show.Venue.ID] = {
          name: show.Venue.Name,
          shows: []
        };
      }
      groupedByVenue[show.Venue.ID].shows.push({
        id: show.ID,
        time: show.ShowTime,
        price: show.Price
      });
    });

    this.venues = Object.values(groupedByVenue);
  }

  selectShow(show: { id: string; time: string; price: number }) {
    this.selectedShow = this.shows.find(s => s.ID === show.id) || null;
    console.log('Selected show:', this.selectedShow);

    //TODO
  }

  getAvailabilityColor(show: any): string {
  const totalSeats = 100; 
  const availableSeats = totalSeats - show.booked_seats.length;

  if (availableSeats > 60) return 'green';
  if (availableSeats > 30) return 'orange';
  return 'red';
}

}