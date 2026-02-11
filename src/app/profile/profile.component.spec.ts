import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { MessageService } from 'primeng/api';

class MockAuthService {
  userSignal() {
    return { user_id: 'u1', role: 'customer' } as any;
  }
  getRole() {
    return 'customer';
  }
}

class MockUserService {
  getProfile = jasmine
    .createSpy('getProfile')
    .and.returnValue(of({ Username: 'User' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockMessageService {
  add = jasmine.createSpy('add');
}

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let userService: MockUserService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserService, useClass: MockUserService },
        { provide: Router, useClass: MockRouter },
        { provide: MessageService, useClass: MockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('loads user profile on init', () => {
    component.ngOnInit();

    expect(userService.getProfile).toHaveBeenCalledWith('u1');
    expect(component.userProfile).toEqual({ Username: 'User' } as any);
  });

  it('navigates to bookings', () => {
    component.navigateTo('bookings');

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/bookings']);
  });
});
