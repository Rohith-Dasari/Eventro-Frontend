import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './guards/authGuard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'events',
        loadComponent:()=>
          import('./events/events.component').then(m=>m.EventsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer', 'admin', 'host'] },
      },
      {
        path: 'events/:id',
        loadComponent:()=>
          import('./event-details/event-details.component').then(m=>m.EventDetailsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer', 'admin','host'] },
      },
      {
        path: 'booking-confirmation',
        loadComponent:()=>
          import('./booking-confirmation/booking-confirmation.component').then(m=>m.BookingConfirmationComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer','admin'] },
      },
      {
        path: 'payment-success',
        loadComponent:()=>
          import('./payment-success/payment-success.component').then(m=>m.PaymentSuccessComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer','admin'] },
      },
      {
        path: 'profile',
        loadComponent:()=>
          import('./profile/profile.component').then(m=>m.ProfileComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer', 'host', 'admin'] },
      },
      {
        path: 'artists',
        loadComponent:()=>
          import('./artists/artists.component').then(m=>m.ArtistsComponent),
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'venues',
        loadComponent:()=>
          import('./venues/venues.component').then(m=>m.VenuesComponent),
        canActivate: [AuthGuard],
        data: { roles: ['host'] },
      },
      {
        path: 'bookings',
        loadComponent:()=>
          import('./bookings-list/bookings-list.component').then(m=>m.BookingsListComponent),
        canActivate: [AuthGuard],
        data: { roles: ['customer'] },
      },
      { path: '', redirectTo: 'events', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];