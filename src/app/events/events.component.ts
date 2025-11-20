import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
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
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-events',
  imports: [
    UpcomingBookingDetailsComponent,
    CommonModule,
    EventsRowComponent,
    UpcomingBookingsRowComponent,
    AddEventDialogComponent,
    ButtonModule,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  role = this.auth.getRole();
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  private navigationSub?: Subscription;

  upcomingBookings: Booking[] = [];
  events: Event[] = [];
  blockedEvents: Event[] = [];
  hostedEvents: Event[] = [];

  defaultImage = './images/hp3.jpg';
  loadingBookings = false;
  loadingEvents = false;
  loadingBlockedEvents = false;
  loadingHostedEvents = false;
  bookingDialogVisible = false;
  selectedBooking: Booking | null = null;
  private hasLoadedOnce = false;

  constructor() {
    this.navigationSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.hasLoadedOnce && this.isEventsRoute(event.urlAfterRedirects ?? event.url)) {
          this.refreshDataOnNavigation();
        }
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
  }

  refreshEvents() {
    this.fetchEvents();
  }

  loadData() {
    if (this.role === 'Customer') {
      this.fetchCustomerBookings();
    }

    this.fetchEvents();

    if (this.role === 'Host') {
      this.fetchHostedEvents();
    }

    this.hasLoadedOnce = true;
  }

  goToEventDetails(event: Event) {
    console.log('Navigating to event details:', event);
    this.router.navigate(['/dashboard/events', event.id], {
      state: { selectedEvent: event },
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
    const normalizedEvents = (events ?? []).map((event) => ({
      ...event,
      is_blocked: this.resolveBlockedFlag(event),
    }));

    this.events = normalizedEvents.filter((event) => !event.is_blocked);
    this.blockedEvents = this.role === 'Admin'
      ? normalizedEvents.filter((event) => event.is_blocked)
      : [];
  }

  private resolveBlockedFlag(event: Event): boolean {
    const possibleFlag = (event as Event & { isBlocked?: boolean }).isBlocked;
    if (typeof possibleFlag === 'boolean') {
      return possibleFlag;
    }
    if (typeof event.is_blocked === 'boolean') {
      return event.is_blocked;
    }
    return false;
  }

  private fetchEvents(): void {
    this.loadingEvents = true;
    if (this.role === 'Admin') {
      this.loadingBlockedEvents = true;
    }
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.partitionEvents(data);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loadingEvents = false;
        this.loadingBlockedEvents = false;
      },
    });
  }

  private fetchHostedEvents(): void {
    this.loadingHostedEvents = true;
    const hostId = this.auth.getID();
    if (!hostId) {
      console.warn('Host ID missing, skipping hosted events refresh');
      this.loadingHostedEvents = false;
      return;
    }
    this.eventService.getEventsofShows(hostId).subscribe({
      next: (data) => {
        const normalizedEvents = ((data as Event[]) ?? []).map((event) => ({
          ...event,
          is_blocked: this.resolveBlockedFlag(event),
        }));
        this.hostedEvents = normalizedEvents.filter((event) => !event.is_blocked);
        this.loadingHostedEvents = false;
      },
      error: (err) => {
        console.error('Error loading hosted events:', err);
        this.loadingHostedEvents = false;
      },
    });
  }

  private fetchCustomerBookings(): void {
    this.loadingBookings = true;
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.upcomingBookings = data;
        this.loadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loadingBookings = false;
      },
    });
  }

  private refreshDataOnNavigation(): void {
    if (this.role === 'Customer') {
      this.fetchCustomerBookings();
    }

    this.fetchEvents();

    if (this.role === 'Host') {
      this.fetchHostedEvents();
    }
  }

  private isEventsRoute(url: string): boolean {
    return url?.includes('/dashboard/events');
  }
}
