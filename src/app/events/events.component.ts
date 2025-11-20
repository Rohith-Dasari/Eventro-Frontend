import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/events';
import { EventsRowComponent } from '../events-row/events-row.component';
import { UpcomingBookingsRowComponent } from '../upcoming-bookings-row/upcoming-bookings-row.component';
import { BookingService } from '../services/bookings.service';
import { Booking } from '../models/bookings';
import { UpcomingBookingDetailsComponent } from '../upcoming-booking-details/upcoming-booking-details.component';
import { AuthService } from '../services/auth.service';
import { AddEventDialogComponent } from '../dashboard/add-event-dialog/add-event-dialog.component';
import { ButtonModule } from 'primeng/button';
import { BookingsListComponent } from '../bookings-list/bookings-list.component';

@Component({
  selector: 'app-events',
  imports: [UpcomingBookingDetailsComponent,CommonModule, EventsRowComponent, UpcomingBookingsRowComponent, AddEventDialogComponent,ButtonModule,BookingsListComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})

export class EventsComponent implements OnInit {
  private auth = inject(AuthService);
  role=this.auth.getRole();
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  
  
  upcomingBookings: Booking[] = [];
  events: Event[] = [];
  blockedEvents:Event[]=[];
  hostedEvents:Event[]=[];

  defaultImage = './images/hp3.jpg';
  loadingBookings = false;
  loadingEvents = false;
  loadingBlockedEvents=false;
  loadingHostedEvents=false;
  bookingDialogVisible = false;
  selectedBooking: Booking | null = null;
  
  
  ngOnInit(): void {
    this.loadData();
  }

  refreshEvents() {
    this.loadingEvents = true;
    if (this.role === 'Admin') {
      this.loadingBlockedEvents = true;
    }
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.partitionEvents(events);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
      },
      error: (err) => {
        console.error('Error refreshing events:', err);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
      }
    });
  }

  loadData() {
    if (this.role === 'Customer') {
    this.loadingBookings = true;
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.upcomingBookings = data;
        this.loadingBookings = false;
        console.log('upcoming bookings:', this.upcomingBookings);
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loadingBookings = false;
      }
    });
  }

    this.loadingEvents = true;
    if (this.role === 'Admin') {
      this.loadingBlockedEvents = true;
    }
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.partitionEvents(data);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
        console.log('events loaded:', data);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
      }
    });

    if(this.role=="Host"){
      this.loadingHostedEvents=true;
      this.eventService.getEventsofShows(this.auth.getID() as string).subscribe({
        next: (data) => {
          if (data){
          this.hostedEvents = data as Event[];
          }
          this.loadingHostedEvents = false;
          console.log('hosted events loaded:', data);
        },
        error: (err) => {
          console.error('Error loading hosted events:', err);
          this.loadingHostedEvents = false;
        }
      })
    }
  }

  goToEventDetails(event: Event) {
    console.log('Navigating to event details:', event);
    this.router.navigate(['/dashboard/events', event.id], {
      state: { selectedEvent: event }
    });
  }

  onBookingClick(booking: Booking) {
    console.log('Opening booking dialog for:', booking);
    this.selectedBooking = booking;
    this.bookingDialogVisible = true;
  }

  openAddEventDialog() {
    console.log('Opening add event dialog');
  }

  private partitionEvents(events: Event[] | undefined) {
    const safeEvents = events ?? [];
    this.events = safeEvents.filter((event) => !event.is_blocked);
    this.blockedEvents = safeEvents.filter((event) => event.is_blocked);
  }
}
    