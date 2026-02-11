import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VenuesComponent } from './venues.component';
import { AuthService } from '../services/auth.service';
import { VenueService } from '../services/venue.service';
import { MessageService } from 'primeng/api';

class MockAuthService {
  id: string | null = 'host-1';
  getID() {
    return this.id;
  }
}

class MockVenueService {
  getUnblockedVenues = jasmine
    .createSpy('getUnblockedVenues')
    .and.returnValue(of([]));
  getBlockedVenues = jasmine
    .createSpy('getBlockedVenues')
    .and.returnValue(of([]));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('VenuesComponent', () => {
  let fixture: ComponentFixture<VenuesComponent>;
  let component: VenuesComponent;
  let authService: MockAuthService;
  let venueService: MockVenueService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenuesComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: VenueService, useClass: MockVenueService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VenuesComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    venueService = TestBed.inject(VenueService) as unknown as MockVenueService;
  });

  it('refreshes venues and normalizes blocked flags', () => {
    venueService.getUnblockedVenues.and.returnValue(
      of([{ id: 'v1', name: 'Venue 1', is_blocked: false }]),
    );
    venueService.getBlockedVenues.and.returnValue(
      of([{ ID: 'v2', Name: 'Venue 2', IsBlocked: true }]),
    );

    component.refreshVenues();

    expect(component.venues.length).toBe(1);
    expect(component.blockedVenues.length).toBe(1);
  });

  it('skips refresh when user id is missing', () => {
    authService.id = null;
    component['userID'] = null;

    component.refreshVenues();

    expect(venueService.getUnblockedVenues).not.toHaveBeenCalled();
  });
});
