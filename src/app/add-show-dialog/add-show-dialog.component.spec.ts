import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { AddShowDialogComponent } from './add-show-dialog.component';
import { ShowService } from '../show.service';
import { VenueService } from '../services/venue.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

class MockShowService {
  addShow = jasmine.createSpy('addShow').and.returnValue(of({}));
}

class MockVenueService {
  getVenues = jasmine.createSpy('getVenues').and.returnValue(
    of([
      { ID: 'v1', Name: 'Venue 1', IsBlocked: false },
      { ID: 'v2', Name: 'Venue 2', IsBlocked: true },
    ]),
  );
}

class MockAuthService {
  id: string | null = 'host-1';
  getID() {
    return this.id;
  }
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('AddShowDialogComponent', () => {
  let fixture: ComponentFixture<AddShowDialogComponent>;
  let component: AddShowDialogComponent;
  let venueService: MockVenueService;
  let showService: MockShowService;
  let messageService: MockMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddShowDialogComponent],
      providers: [
        DatePipe,
        { provide: ShowService, useClass: MockShowService },
        { provide: VenueService, useClass: MockVenueService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddShowDialogComponent);
    component = fixture.componentInstance;
    venueService = TestBed.inject(VenueService) as unknown as MockVenueService;
    showService = TestBed.inject(ShowService) as unknown as MockShowService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
  });

  it('opens dialog and loads venues', () => {
    component.open();

    expect(component.visible).toBe(true);
    expect(venueService.getVenues).toHaveBeenCalledWith('host-1');
    expect(component.venues.length).toBe(1);
    expect(component.venues[0].id).toBe('v1');
  });

  it('shows error when event id is missing', () => {
    component.eventID = '';

    component.submit({
      invalid: false,
      form: { markAllAsTouched: () => {} },
      controls: {},
    } as any);

    expect(messageService.add).toHaveBeenCalled();
    expect(showService.addShow).not.toHaveBeenCalled();
  });

  it('submits show when form is valid', () => {
    const emitSpy = spyOn(component.showAdded, 'emit');
    component.eventID = 'event-1';
    component.selectedDate = new Date('2026-02-11T19:30:00');
    component.newShow.price = 200;

    component.submit({
      invalid: false,
      form: { markAllAsTouched: () => {} },
      controls: {},
    } as any);

    expect(showService.addShow).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });
});
