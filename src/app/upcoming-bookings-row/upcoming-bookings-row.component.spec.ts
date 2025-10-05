import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingBookingsRowComponent } from './upcoming-bookings-row.component';

describe('UpcomingBookingsRowComponent', () => {
  let component: UpcomingBookingsRowComponent;
  let fixture: ComponentFixture<UpcomingBookingsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingBookingsRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingBookingsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
