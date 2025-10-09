import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedEventsRowComponent } from './blocked-events-row.component';

describe('BlockedEventsRowComponent', () => {
  let component: BlockedEventsRowComponent;
  let fixture: ComponentFixture<BlockedEventsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedEventsRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedEventsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
