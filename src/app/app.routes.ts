import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { EventsComponent } from './events/events.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './guards/authGuard';
import { EventDetailsComponent } from './event-details/event-details.component';
import { ArtistsComponent } from './artists/artists.component';
import { VenuesComponent } from './venues/venues.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { BookingsListComponent } from './bookings-list/bookings-list.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
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
        component: EventsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer', 'Admin'] },
      },
      {
        path: 'events/:id',
        component: EventDetailsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer', 'Admin'] },
      },
      {
        path: 'booking-confirmation',
        component: BookingConfirmationComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer'] },
      },
      {
        path: 'payment-success',
        component: PaymentSuccessComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer'] },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer', 'Host', 'Admin'] },
      },
      {
        path: 'artists',
        component: ArtistsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'venues',
        component: VenuesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Host', 'Admin'] },
      },
      {
        path: 'bookings',
        component: BookingsListComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Customer'] },
      },
      // {
      //   path: 'shows',
      //   component: ShowsComponent,
      //   canActivate: [AuthGuard],
      //   data: { roles: ['Host', 'Admin'] },
      // },
      { path: '', redirectTo: 'events', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];