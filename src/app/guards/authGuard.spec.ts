import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { AuthGuard } from './authGuard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

class MockAuthService {
  userSignal = signal<User | null>(null);
  isLoggedIn = jasmine.createSpy('isLoggedIn');
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: MockAuthService;
  let router: Router;

  const makeRoute = (roles?: string[]): ActivatedRouteSnapshot =>
    ({
      data: roles ? { roles } : {},
    }) as ActivatedRouteSnapshot;

  const expectRedirect = (result: boolean | UrlTree, url: string) => {
    expect(router.serializeUrl(result as UrlTree)).toBe(url);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        provideRouter([]),
      ],
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to /login when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate(makeRoute(['admin']));

    expectRedirect(result, '/login');
  });

  it('allows access when logged in and no roles are required', () => {
    authService.isLoggedIn.and.returnValue(true);

    const result = guard.canActivate(makeRoute());

    expect(result).toBe(true);
  });

  it('allows access when user role is in allowed list', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.userSignal.set({ role: 'admin' } as User);

    const result = guard.canActivate(makeRoute(['admin', 'host']));

    expect(result).toBe(true);
  });

  it('redirects by role when user is not allowed', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.userSignal.set({ role: 'customer' } as User);

    const result = guard.canActivate(makeRoute(['admin']));

    expectRedirect(result, '/dashboard/events');
  });
});
