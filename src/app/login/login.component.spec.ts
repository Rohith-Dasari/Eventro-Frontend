import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginComponent } from './login.component';

class MockAuthService {
  login = jasmine.createSpy('login');
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
  });

  it('navigates to dashboard on login success', () => {
    const navigateSpy = spyOn(router, 'navigate');
    authService.login.and.returnValue(of({}));

    component.email = 'test@example.com';
    component.password = 'secret';
    component.onLogin();

    expect(component.loading).toBe(false);
    expect(component.loginError).toBe(false);
    expect(authService.login).toHaveBeenCalledWith(
      'test@example.com',
      'secret',
    );
    expect(navigateSpy).toHaveBeenCalledWith(['dashboard', 'events']);
  });

  it('sets and clears login error on failure', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('fail')));

    component.onLogin();

    expect(component.loading).toBe(false);
    expect(component.loginError).toBe(true);

    tick(2999);
    expect(component.loginError).toBe(true);

    tick(1);
    expect(component.loginError).toBe(false);
  }));
});
