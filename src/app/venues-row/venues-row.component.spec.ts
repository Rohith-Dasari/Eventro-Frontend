import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { VenuesRowComponent } from './venues-row.component';
import { VenueService } from '../services/venue.service';
import { MessageService } from 'primeng/api';

class MockVenueService {
  moderateVenue = jasmine.createSpy('moderateVenue').and.returnValue(of({}));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('VenuesRowComponent', () => {
  let fixture: ComponentFixture<VenuesRowComponent>;
  let component: VenuesRowComponent;
  let venueService: MockVenueService;
  let messageService: MockMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenuesRowComponent],
      providers: [
        { provide: VenueService, useClass: MockVenueService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VenuesRowComponent);
    component = fixture.componentInstance;
    venueService = TestBed.inject(VenueService) as unknown as MockVenueService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
  });

  it('moderates venue and emits on success', () => {
    const emitSpy = spyOn(component.moderateVenue, 'emit');
    const venue = { ID: 'v1', Name: 'Venue', IsBlocked: false } as any;

    component.onToggle(venue, {} as Event);

    expect(venueService.moderateVenue).toHaveBeenCalledWith('v1', true);
    expect(messageService.add).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
    expect(component.loadingVenueId).toBeNull();
  });

  it('reverts status on error', () => {
    const venue = { ID: 'v1', Name: 'Venue', IsBlocked: false } as any;
    venueService.moderateVenue.and.returnValue(
      throwError(() => new Error('fail')),
    );

    component.onToggle(venue, {} as Event);

    expect(venue.IsBlocked).toBe(false);
    expect(messageService.add).toHaveBeenCalled();
    expect(component.loadingVenueId).toBeNull();
  });
});
