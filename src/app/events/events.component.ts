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
import { Subscription, filter, distinctUntilChanged, skip } from 'rxjs';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { LocationService } from '../services/location.service';

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
  role = (this.auth.getRole() || '').toLowerCase();
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  private locationService = inject(LocationService);
  private navigationSub?: Subscription;
  private locationSub?: Subscription;

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

    this.locationSub = this.locationService.city$
      .pipe(distinctUntilChanged(), skip(1))
      .subscribe(() => {
        this.refreshEvents();
      });
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
    this.locationSub?.unsubscribe();
  }

  refreshEvents() {
    this.fetchUnblockedEvents();
    if (this.role === 'admin') {
      this.fetchBlockedEvents();
    }
    if (this.role === 'host') {
      this.fetchHostedEvents();
    }
  }

  loadData() {
    if (this.role === 'customer') {
      this.fetchCustomerBookings();
    }

    this.fetchUnblockedEvents();

    if (this.role === 'admin') {
      this.fetchBlockedEvents();
    }

    if (this.role === 'host') {
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
    if (this.role !== 'admin') {
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
        this.upcomingBookings = this.filterUpcomingBookings(data);
        this.loadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.loadingBookings = false;
      },
    });
  }

  private refreshDataOnNavigation(): void {
    if (this.role === 'customer') {
      this.fetchCustomerBookings();
    }

    this.fetchUnblockedEvents();

    if (this.role === 'admin') {
      this.fetchBlockedEvents();
    }

    if (this.role === 'host') {
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

  private filterUpcomingBookings(bookings: Booking[]): Booking[] {
    const now = Date.now();

    const enriched = bookings.map((booking) => {
      const rawValue = this.resolveShowDate(booking);
      const parsed = rawValue
        ? rawValue instanceof Date
          ? rawValue
          : new Date(rawValue)
        : undefined;

      return {
        booking,
        showDate:
          parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined,
      };
    });

    return enriched
      .filter((entry) => entry.showDate && entry.showDate.getTime() >= now)
      .sort((a, b) => (a.showDate!.getTime() - b.showDate!.getTime()))
      .map((entry) => entry.booking);
  }

  private resolveShowDate(booking: Booking): string | Date | undefined {
    return (
      booking.booking_date ??
      (booking as any)?.show_date ??
      (booking as any)?.ShowDate ??
      (booking as any)?.showDate ??
      (booking as any)?.Show_date ??
      (booking as any)?.bookingDate ??
      (booking as any)?.BookingDate
    );
  }
}
