import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { SeatMapComponent } from './seat-map.component';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ShowService } from '../show.service';

class MockAuthService {
  role = 'customer';
  id: string | null = 'user-1';

  getRole() {
    return this.role;
  }

  getID() {
    return this.id;
  }

  getUserByMailID = jasmine
    .createSpy('getUserByMailID')
    .and.returnValue(of({ UserID: 'user-2' }));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

class MockShowService {
  blockShow = jasmine.createSpy('blockShow').and.returnValue(of({}));
}

describe('SeatMapComponent', () => {
  let fixture: ComponentFixture<SeatMapComponent>;
  let component: SeatMapComponent;
  let authService: MockAuthService;
  let messageService: MockMessageService;
  let showService: MockShowService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMapComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: MessageService, useClass: MockMessageService },
        { provide: ShowService, useClass: MockShowService },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatMapComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
    showService = TestBed.inject(ShowService) as unknown as MockShowService;
    router = TestBed.inject(Router);
  });

  it('initializes seats and marks booked seats', () => {
    component.show = { booked_seats: ['A1', 'B2'] };
    component.price = 100;

    component.ngOnInit();

    expect(component.seats.length).toBe(100);
    expect(component.getSeat(1, 1)?.isBooked).toBe(true);
    expect(component.getSeat(2, 2)?.isBooked).toBe(true);
    expect(component.bookingSummary).toContain(
      'Total Number of Tickets Booked: 2',
    );
  });

  it('prevents selecting more than 7 seats', () => {
    component.show = { booked_seats: [] };
    component.ngOnInit();

    for (let seat = 1; seat <= 7; seat++) {
      component.toggleSeat(1, seat);
    }

    component.toggleSeat(1, 8);

    expect(component.selectedSeats.length).toBe(7);
    expect(messageService.add).toHaveBeenCalled();
  });

  it('returns an error when confirming with no seats', () => {
    component.show = { booked_seats: [], venue: {}, event: {} };
    component.ngOnInit();

    const result = component.makeBookingData();

    expect(result).toBeUndefined();
    expect(component.errorMessage).toBe('Please select at least one seat.');
  });

  it('navigates to confirmation when customer confirms booking', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.show = {
      id: 'show-1',
      booked_seats: [],
      venue: { venue_name: 'Venue', city: 'City', state: 'State' },
      event: { name: 'Event' },
      show_date: new Date().toISOString(),
      show_time: '19:00:00',
    };

    component.ngOnInit();
    component.toggleSeat(1, 1);

    component.onClickConfirm();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/dashboard/booking-confirmation'],
      {
        state: jasmine.objectContaining({ showId: 'show-1' }),
      },
    );
  });

  it('blocks and unblocks shows via the service', () => {
    component.show = { id: 'show-1', booked_seats: [], is_blocked: false };
    component.ngOnInit();
    component.toggleSeat(1, 1);

    component.onBlockShow();

    expect(showService.blockShow).toHaveBeenCalledWith('show-1', true);
    expect(component.getSeat(1, 1)?.isSelected).toBe(false);
    expect(messageService.add).toHaveBeenCalled();
  });
});
