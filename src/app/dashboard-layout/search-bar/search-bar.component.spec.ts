import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SearchBarComponent } from './search-bar.component';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

class MockEventService {
  searchEventsByName = jasmine
    .createSpy('searchEventsByName')
    .and.returnValue(of([]));
}

class MockAuthService {
  getRole() {
    return 'customer';
  }
}

class MockRouter {
  url = '/dashboard/events';
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine
    .createSpy('navigateByUrl')
    .and.returnValue(Promise.resolve(true));
}

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;
  let component: SearchBarComponent;
  let eventService: MockEventService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        { provide: EventService, useClass: MockEventService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as unknown as MockEventService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('queries events with debounce', fakeAsync(() => {
    eventService.searchEventsByName.and.returnValue(
      of([
        { id: 'e1', is_blocked: true },
        { id: 'e2', is_blocked: false },
      ] as any),
    );

    component.onSearchChange('test');
    tick(499);
    expect(eventService.searchEventsByName).not.toHaveBeenCalled();

    tick(1);
    expect(eventService.searchEventsByName).toHaveBeenCalledWith(
      'test',
      null,
      true,
    );
    expect(component.searchResults.length).toBe(1);
  }));

  it('resets search on empty input', () => {
    component.onSearchChange('');

    expect(component.searchResults.length).toBe(0);
    expect(component.showResults).toBe(false);
  });

  it('navigates when selecting an event', fakeAsync(() => {
    component.selectEvent({ id: 'e1' } as any);
    tick();

    expect(router.navigate).toHaveBeenCalled();
    expect(component.showResults).toBe(false);
  }));
});
