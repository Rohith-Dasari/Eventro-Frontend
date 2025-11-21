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
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-events',
  imports: [
    UpcomingBookingDetailsComponent,
    CommonModule,
    EventsRowComponent,
    UpcomingBookingsRowComponent,
    AddEventDialogComponent,
    ButtonModule,
    SpinnerComponent,
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
    this.fetchUnblockedEvents();
    if (this.role === 'Admin') {
      this.fetchBlockedEvents();
    }
  }

  loadData() {
    if (this.role === 'Customer') {
      this.fetchCustomerBookings();
    }

    this.fetchUnblockedEvents();

    if (this.role === 'Admin') {
      this.fetchBlockedEvents();
    }

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

  private fetchUnblockedEvents(): void {
    this.loadingEvents = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data ?? [];
        this.loadingEvents = false;
      },
      error: (err) => {
        console.error('Error loading unblocked events:', err);
        this.loadingEvents = false;
      },
    });
  }

  private fetchBlockedEvents(): void {
    if (this.role !== 'Admin') {
      return;
    }

    this.loadingBlockedEvents = true;
    this.eventService.getBlockedEvents().subscribe({
      next: (data) => {
        this.blockedEvents = data ?? [];
        this.loadingBlockedEvents = false;
      },
      error: (err) => {
        console.error('Error loading blocked events:', err);
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
        this.hostedEvents = (data as Event[]) ?? [];
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

    this.fetchUnblockedEvents();

    if (this.role === 'Admin') {
      this.fetchBlockedEvents();
    }

    if (this.role === 'Host') {
      this.fetchHostedEvents();
    }
  }

  private isEventsRoute(url: string): boolean {
    return url?.includes('/dashboard/events');
  }

  get isDashboardLoading(): boolean {
    return (
      this.loadingEvents ||
      this.loadingBlockedEvents ||
      this.loadingHostedEvents ||
      this.loadingBookings
    );
  }
}
