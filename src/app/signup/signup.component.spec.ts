import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SignupComponent } from './signup.component';

class MockAuthService {
  signup = jasmine.createSpy('signup');
}

describe('SignupComponent', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let component: SignupComponent;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
  });

  it('validates email, phone, and password formats', () => {
    expect(component.isValidEmail('invalid')).toBe(false);
    expect(component.isValidEmail('test@example.com')).toBe(true);

    expect(component.isValidPhone('123')).toBe(false);
    expect(component.isValidPhone('1234567890')).toBe(true);

    expect(component.isValidPassword('short1!')).toBe(false);
    expect(component.isValidPassword('MyPassword123!')).toBe(true);
  });

  it('sets phoneNumber on phone input', () => {
    const event = { target: { value: '123-456-7890' } } as any;

    component.onPhoneInput(event);

    expect(component.phoneNumber).toBe('1234567890');
    expect(event.target.value).toBe('1234567890');
  });

  it('reports form as valid when all fields are valid', () => {
    component.username = 'user';
    component.email = 'test@example.com';
    component.phoneNumber = '1234567890';
    component.password = 'MyPassword123!';

    expect(component.isFormValid).toBe(true);
  });

  it('navigates on successful signup', () => {
    const navigateSpy = spyOn(router, 'navigate');
    authService.signup.and.returnValue(of({}));

    component.username = 'user';
    component.email = 'test@example.com';
    component.phoneNumber = '1234567890';
    component.password = 'MyPassword123!';

    component.onSignup();

    expect(authService.signup).toHaveBeenCalledWith(
      'user',
      'test@example.com',
      '1234567890',
      'MyPassword123!',
    );
    expect(navigateSpy).toHaveBeenCalledWith(['dashboard', 'events']);
  });

  it('handles signup errors', fakeAsync(() => {
    authService.signup.and.returnValue(
      throwError(() => ({ error: { message: 'Bad request' } })),
    );

    component.onSignup();

    expect(component.signupError).toBe('Bad request');
    expect(component.loading).toBe(false);

    tick(2000);
    expect(component.loading).toBe(false);
  }));
});
