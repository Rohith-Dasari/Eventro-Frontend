import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EventDetailsComponent } from './event-details.component';
import { EventService } from '../services/event.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

class MockEventService {
  getEventByID = jasmine.createSpy('getEventByID').and.returnValue(of({}));
  getShows = jasmine.createSpy('getShows').and.returnValue(of([]));
  getShowsByHostAndEvent = jasmine
    .createSpy('getShowsByHostAndEvent')
    .and.returnValue(of([]));
  moderateEvent = jasmine.createSpy('moderateEvent').and.returnValue(of({}));
}

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

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('EventDetailsComponent', () => {
  let fixture: ComponentFixture<EventDetailsComponent>;
  let component: EventDetailsComponent;
  let eventService: MockEventService;
  let messageService: MockMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailsComponent],
      providers: [
        { provide: EventService, useClass: MockEventService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as unknown as MockEventService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
  });

  afterEach(() => {
    history.replaceState({}, '');
  });

  it('stops loading when no event is provided', () => {
    history.replaceState({}, '');

    component.ngOnInit();

    expect(component.loadingEventDetails).toBe(false);
    expect(eventService.getEventByID).not.toHaveBeenCalled();
  });

  it('loads event details and shows when event exists', () => {
    const eventState = { id: 'event-1', is_blocked: false, name: 'Concert' };
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    history.replaceState({ selectedEvent: eventState }, '');

    eventService.getEventByID.and.returnValue(
      of({
        description: 'Desc',
        artist_names: [],
        artist_ids: [],
        duration: '2h',
        is_blocked: false,
      }),
    );

    eventService.getShows.and.returnValue(
      of([{ show_date: future, show_time: '19:00:00' }] as any),
    );

    component.ngOnInit();

    expect(eventService.getEventByID).toHaveBeenCalledWith('event-1');
    expect(eventService.getShows).toHaveBeenCalledWith('event-1');
    expect(component.availableDates.length).toBeGreaterThan(0);
    expect(component.selectedDate).toBeDefined();
    expect(component.loadingEventDetails).toBe(false);
  });

  it('updates event status on successful moderation', () => {
    component.event = {
      id: 'event-1',
      name: 'Concert',
      is_blocked: false,
    } as any;

    component.onToggle(true);

    expect(eventService.moderateEvent).toHaveBeenCalledWith('event-1', true);
    expect(component.event.is_blocked).toBe(true);
    expect(component.status).toBe('The event has been blocked');
    expect(messageService.add).toHaveBeenCalled();
  });

  it('reverts toggle when moderation fails', () => {
    component.event = {
      id: 'event-1',
      name: 'Concert',
      is_blocked: false,
    } as any;
    eventService.moderateEvent.and.returnValue(
      throwError(() => new Error('fail')),
    );

    component.onToggle(true);

    expect(component.checked).toBe(false);
    expect(messageService.add).toHaveBeenCalled();
  });
});
