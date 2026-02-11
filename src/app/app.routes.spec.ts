import { routes } from './app.routes';
import { AuthGuard } from './guards/authGuard';

describe('app routes', () => {
  it('includes login and signup routes', () => {
    const loginRoute = routes.find((route) => route.path === 'login');
    const signupRoute = routes.find((route) => route.path === 'signup');

    expect(loginRoute).toBeDefined();
    expect(signupRoute).toBeDefined();
  });

  it('protects dashboard routes with AuthGuard', () => {
    const dashboardRoute = routes.find((route) => route.path === 'dashboard');

    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.canActivate).toContain(AuthGuard);
    expect(dashboardRoute?.canActivateChild).toContain(AuthGuard);
  });

  it('defines dashboard child routes with role data', () => {
    const dashboardRoute = routes.find((route) => route.path === 'dashboard');
    const children = dashboardRoute?.children ?? [];

    const eventsRoute = children.find((route) => route.path === 'events');
    const venuesRoute = children.find((route) => route.path === 'venues');
    const bookingsRoute = children.find((route) => route.path === 'bookings');

    expect(eventsRoute?.data?.['roles']).toEqual(['customer', 'admin', 'host']);
    expect(venuesRoute?.data?.['roles']).toEqual(['host']);
    expect(bookingsRoute?.data?.['roles']).toEqual(['customer']);
  });
});
