import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { EventsComponent } from './events.component';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { BookingService } from '../services/bookings.service';
import { LocationService } from '../services/location.service';
import { MessageService } from 'primeng/api';

class MockAuthService {
  role = 'customer';
  id: string | null = 'host-1';

  getRole() {
    return this.role;
  }

  getID() {
    return this.id;
  }
}

class MockEventService {
  getEvents = jasmine.createSpy('getEvents').and.returnValue(of([]));
  getBlockedEvents = jasmine
    .createSpy('getBlockedEvents')
    .and.returnValue(of([]));
  getEventsofShows = jasmine
    .createSpy('getEventsofShows')
    .and.returnValue(of([]));
}

class MockBookingService {
  getBookings = jasmine.createSpy('getBookings').and.returnValue(of([]));
}

class MockLocationService {
  private citySubject = new BehaviorSubject<string>('noida');
  city$ = this.citySubject.asObservable();
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('EventsComponent', () => {
  let fixture: ComponentFixture<EventsComponent>;
  let component: EventsComponent;
  let authService: MockAuthService;
  let eventService: MockEventService;
  let bookingService: MockBookingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: EventService, useClass: MockEventService },
        { provide: BookingService, useClass: MockBookingService },
        { provide: LocationService, useClass: MockLocationService },
        { provide: MessageService, useClass: MockMessageService },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    eventService = TestBed.inject(EventService) as unknown as MockEventService;
    bookingService = TestBed.inject(
      BookingService,
    ) as unknown as MockBookingService;
  });

  it('loads unblocked events and upcoming bookings for customers', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    bookingService.getBookings.and.returnValue(
      of([
        { booking_date: past, booking_id: 'past' },
        { booking_date: future, booking_id: 'future' },
      ] as any),
    );

    eventService.getEvents.and.returnValue(of([{ id: 'event-1' }] as any));

    fixture.detectChanges();

    expect(eventService.getEvents).toHaveBeenCalled();
    expect(bookingService.getBookings).toHaveBeenCalled();
    expect(component.events.length).toBe(1);
    expect(component.upcomingBookings.length).toBe(1);
    expect(component.upcomingBookings[0].booking_id).toBe('future');
  });

  it('skips hosted events fetch when host id is missing', () => {
    authService.role = 'host';
    authService.id = null;
    component.role = 'host';

    component.loadData();

    expect(eventService.getEventsofShows).not.toHaveBeenCalled();
    expect(component.loadingHostedEvents).toBe(false);
  });
});
