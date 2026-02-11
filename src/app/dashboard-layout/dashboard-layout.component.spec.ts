import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../services/auth.service';
import { LocationService } from '../services/location.service';
import { EventService } from '../services/event.service';

class MockAuthService {
  userSignal() {
    return { email: 'user@example.com', role: 'host' } as any;
  }
  getRole() {
    return 'host';
  }
  logout = jasmine.createSpy('logout');
}

class MockLocationService {
  setCity = jasmine.createSpy('setCity');
}

class MockEventService {}

describe('DashboardLayoutComponent', () => {
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let component: DashboardLayoutComponent;
  let authService: MockAuthService;
  let locationService: MockLocationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: LocationService, useClass: MockLocationService },
        { provide: EventService, useClass: MockEventService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    locationService = TestBed.inject(
      LocationService,
    ) as unknown as MockLocationService;
    router = TestBed.inject(Router);
  });

  it('initializes user and navigation state', () => {
    component.ngOnInit();

    expect(component.username).toBe('user@example.com');
    expect(component.role).toBe('host');
    expect(locationService.setCity).toHaveBeenCalledWith('noida');
    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('logs out and navigates to login', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.onLogout();

    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
