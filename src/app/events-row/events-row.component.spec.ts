import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsRowComponent } from './events-row.component';

describe('EventsRowComponent', () => {
  let fixture: ComponentFixture<EventsRowComponent>;
  let component: EventsRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsRowComponent);
    component = fixture.componentInstance;
  });

  it('emits when an event is clicked', () => {
    const event = { id: 'event-1' } as any;
    const emitSpy = spyOn(component.eventClick, 'emit');

    component.onEventClick(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  });
});
