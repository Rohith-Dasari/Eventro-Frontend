import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AddEventDialogComponent } from './add-event-dialog.component';
import { EventService } from '../../services/event.service';
import { MessageService } from 'primeng/api';

class MockEventService {
  addEvent = jasmine.createSpy('addEvent').and.returnValue(of({}));
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('AddEventDialogComponent', () => {
  let fixture: ComponentFixture<AddEventDialogComponent>;
  let component: AddEventDialogComponent;
  let eventService: MockEventService;
  let messageService: MockMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEventDialogComponent],
      providers: [
        { provide: EventService, useClass: MockEventService },
        { provide: MessageService, useClass: MockMessageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEventDialogComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as unknown as MockEventService;
    messageService = TestBed.inject(
      MessageService,
    ) as unknown as MockMessageService;
  });

  it('does not submit when form is invalid or duration missing', () => {
    component.durationInt = null;

    component.submit({
      invalid: false,
      form: { markAllAsTouched: () => {} },
    } as any);

    expect(eventService.addEvent).not.toHaveBeenCalled();
  });

  it('submits a valid event', () => {
    const emitSpy = spyOn(component.eventAdded, 'emit');
    component.newEvent = {
      name: ' Event ',
      description: ' Desc ',
      duration: 0,
      category: 'concert',
      artist_ids: ['id-1'],
    };
    component.durationInt = 120;

    component.submit({
      invalid: false,
      form: { markAllAsTouched: () => {} },
    } as any);

    expect(eventService.addEvent).toHaveBeenCalledWith({
      name: 'Event',
      description: 'Desc',
      duration: 120,
      category: 'concert',
      artist_ids: ['id-1'],
    });
    expect(messageService.add).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });
});
