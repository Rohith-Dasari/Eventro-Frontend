import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/events';
import { EventsRowComponent } from '../events-row/events-row.component';
import { UpcomingBookingsRowComponent } from '../upcoming-bookings-row/upcoming-bookings-row.component';
import { BookingService } from '../services/bookings.service';
import { EnrichedBooking } from '../models/bookings';
import { UpcomingBookingDetailsComponent } from '../upcoming-booking-details/upcoming-booking-details.component';
import { AuthService } from '../services/auth.service';
import { AddEventDialogComponent } from '../dashboard/add-event-dialog/add-event-dialog.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-events',
  imports: [UpcomingBookingDetailsComponent,CommonModule, EventsRowComponent, UpcomingBookingsRowComponent, AddEventDialogComponent,ButtonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})

export class EventsComponent implements OnInit {
  private auth = inject(AuthService);
  role=this.auth.getRole();
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  
  upcomingBookings: EnrichedBooking[] = [];
  events: Event[] = [];
  blockedEvents:Event[]=[];
  defaultImage = './images/hp3.jpg';
  loadingBookings = false;
  loadingEvents = false;
  loadingBlockedEvents=false;
  bookingDialogVisible = false;
  selectedBooking: EnrichedBooking | null = null;
  blockedEventCount=0;
  
  

  ngOnInit(): void {
    this.loadData();
  }

  refreshEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
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
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = (data as Event[]).filter((eve)=>!eve.is_blocked);
        this.loadingEvents = false;
        console.log('events loaded:', data);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loadingEvents = false;
      }
    });
    
    if(this.role=="Admin"){
      this.loadingBlockedEvents=true;
      this.eventService.getBlockedEvents().subscribe({
        next: (data) => {
          if (data){
          this.blockedEvents = data as Event[];
          }
          this.loadingBlockedEvents = false;
          console.log('blocked events loaded:', data);
          this.blockedEventCount=this.blockedEvents.length;
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.loadingEvents = false;
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

  onBookingClick(booking: EnrichedBooking) {
    console.log('Opening booking dialog for:', booking);
    this.selectedBooking = booking;
    this.bookingDialogVisible = true;
  }

  openAddEventDialog() {
    console.log('Opening add event dialog');
  }
}
    