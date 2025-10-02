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
  shows!: Shows[];
  venuesMap: { [venueId: string]: Venues } = {};
  availableDates!:Date[];
  selectedDate: Date | null = null;
  venues: { name: string; shows: { id: string; time: string; price: number }[] }[] = [];
  selectedShow: Shows | null = null;

  private eventService=inject(EventService);

  ngOnInit(): void {
    this.event = history.state?.selectedEvent;
    console.log(this.event);
    if (!this.event) {
      console.error('No event info available.');
      return;
    }
    console.log(this.event)
    this.loadEvent(this.event.id);
  }

  loadEvent(eventId: string) {
    this.eventService.getShows(eventId).subscribe((shows: Shows[]) => {
      this.shows = shows;

      if (!shows.length) return;
      const firstDate = new Date(shows[0].show_date);
      this.availableDates = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(firstDate);
        d.setDate(d.getDate() + i);
        return d;
      });

      this.selectedDate = this.availableDates[0];
      const venueIds = Array.from(new Set(shows.map(s => s.venue_id)));
      
      const venueRequests = venueIds.map(id => this.eventService.getVenue(id));

      forkJoin(venueRequests).subscribe((venues: Venues[]) => {
        console.log(venues)
        venues.forEach(v => {
          this.venuesMap[v.ID] = v;
        });

        this.loadVenues(this.selectedDate);
      });
    });
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.loadVenues(date);
  }

  loadVenues(date: Date | null) {
    if (!date) return;

    const showsForDate = this.shows.filter(
      s => new Date(s.show_date).toDateString() === date.toDateString()
    );

    const groupedByVenue: { [venueId: string]: { name: string; shows: { id: string; time: string; price: number }[] } } = {};

    showsForDate.forEach(show => {
      if (!groupedByVenue[show.venue_id]) {
        const venueInfo = this.venuesMap[show.venue_id];
        console.log(venueInfo)
        
        groupedByVenue[show.venue_id] = {
          name: venueInfo?.Name || 'Unknown',
          shows: []
        };
      }
      groupedByVenue[show.venue_id].shows.push({
        id: show.id,
        time: show.show_time,
        price: show.price
      });
    });

    this.venues = Object.values(groupedByVenue);
  }

  selectShow(show: { id: string; time: string; price: number }) {
    this.selectedShow = this.shows.find(s => s.id === show.id) || null;
    console.log('Selected show:', this.selectedShow);
    // Later: trigger seatmap modal/component
  }
}