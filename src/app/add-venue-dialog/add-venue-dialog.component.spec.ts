import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AddVenueDialogComponent } from './add-venue-dialog.component';
import { VenueService } from '../services/venue.service';
import { MessageService } from 'primeng/api';

class MockVenueService {
  addVenue = jasmine.createSpy('addVenue').and.returnValue(of({}));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('AddVenueDialogComponent', () => {
  let fixture: ComponentFixture<AddVenueDialogComponent>;
  let component: AddVenueDialogComponent;
  let venueService: MockVenueService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVenueDialogComponent],
      providers: [
        { provide: VenueService, useClass: MockVenueService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddVenueDialogComponent);
    component = fixture.componentInstance;
    venueService = TestBed.inject(VenueService) as unknown as MockVenueService;
  });

  it('does not submit when form is invalid', () => {
    const markSpy = jasmine.createSpy('markAllAsTouched');

    component.submit({
      invalid: true,
      form: { markAllAsTouched: markSpy },
    } as any);

    expect(markSpy).toHaveBeenCalled();
    expect(venueService.addVenue).not.toHaveBeenCalled();
  });

  it('submits trimmed venue data', () => {
    const emitSpy = spyOn(component.venueAdded, 'emit');
    component.newVenue = {
      name: ' Venue ',
      city: ' City ',
      state: ' State ',
      isSeatLayoutRequired: true,
    };

    component.submit({
      invalid: false,
      form: { markAllAsTouched: () => {} },
    } as any);

    expect(venueService.addVenue).toHaveBeenCalledWith({
      name: 'Venue',
      city: 'City',
      state: 'State',
      isSeatLayoutRequired: true,
    });
    expect(emitSpy).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });
});
