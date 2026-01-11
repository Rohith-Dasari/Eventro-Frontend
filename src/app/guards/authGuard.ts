import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    const user = this.auth.userSignal();
    const userRole = (user?.role || localStorage.getItem('role'))?.toLowerCase();
    const allowedRoles = (route.data?.['roles'] as string[] | undefined)?.map(r => r.toLowerCase());

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    if (userRole === 'customer') return this.router.parseUrl('/dashboard/events');
    if (userRole === 'host') return this.router.parseUrl('/dashboard/venues');
    if (userRole === 'admin') return this.router.parseUrl('/dashboard/events');

    return this.router.parseUrl('/login');
  }
}
