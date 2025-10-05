import { Component, OnInit, inject } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { Event } from '../models/events';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsRowComponent } from '../events-row/events-row.component';
import { UpcomingBookingsRowComponent } from '../upcoming-bookings-row/upcoming-bookings-row.component';
import { BookingService } from '../services/bookings.service';
import { EnrichedBooking } from '../models/bookings';
import { UpcomingBookingDetailsComponent } from '../upcoming-booking-details/upcoming-booking-details.component';

@Component({
  selector: 'app-events',
  imports: [UpcomingBookingDetailsComponent,CommonModule, EventsRowComponent, UpcomingBookingsRowComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})

export class EventsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  
  upcomingBookings: EnrichedBooking[] = [];
  events: Event[] = [];
  defaultImage = './images/hp3.jpg';
  loadingBookings = false;
  loadingEvents = false;
  bookingDialogVisible = false;
  selectedBooking: EnrichedBooking | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
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

    this.loadingEvents = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data as Event[];
        this.loadingEvents = false;
        console.log('events loaded:', data);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loadingEvents = false;
      }
    });
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
}
    