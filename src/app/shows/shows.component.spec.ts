import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowsComponent } from './shows.component';

describe('ShowsComponent', () => {
  let fixture: ComponentFixture<ShowsComponent>;
  let component: ShowsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowsComponent);
    component = fixture.componentInstance;
  });

  it('filters and groups shows by venue and time', () => {
    const selectedDate = new Date('2026-02-11T00:00:00');
    component.selectedDate = selectedDate;
    component.priceRange = [0, 500];
    component.userRole = 'customer';
    component.showBlocked = false;

    component.shows = [
      {
        showDateObj: new Date('2026-02-11T10:00:00'),
        price: 200,
        venue: { venue_id: 'v1', venue_name: 'Venue A' },
        show_time: '10:00:00',
        is_blocked: false,
      } as any,
      {
        showDateObj: new Date('2026-02-11T09:00:00'),
        price: 150,
        venue: { venue_id: 'v1', venue_name: 'Venue A' },
        show_time: '09:00:00',
        is_blocked: false,
      } as any,
      {
        showDateObj: new Date('2026-02-11T08:00:00'),
        price: 150,
        venue: { venue_id: 'v2', venue_name: 'Venue B' },
        show_time: '08:00:00',
        is_blocked: true,
      } as any,
    ];

    component.filterShows();

    expect(component.venues.length).toBe(1);
    expect(component.venues[0].name).toBe('Venue A');
    expect(component.venues[0].shows.length).toBe(2);
    expect(component.venues[0].shows[0].show_time).toBe('09:00:00');
  });

  it('shows blocked entries for admins when filter is enabled', () => {
    component.selectedDate = new Date('2026-02-11T00:00:00');
    component.priceRange = [0, 500];
    component.userRole = 'admin';
    component.showBlocked = true;

    component.shows = [
      {
        showDateObj: new Date('2026-02-11T08:00:00'),
        price: 150,
        venue: { venue_id: 'v1', venue_name: 'Venue A' },
        show_time: '08:00:00',
        is_blocked: true,
      } as any,
    ];

    component.filterShows();

    expect(component.venues.length).toBe(1);
    expect(component.venues[0].shows.length).toBe(1);
  });
});
