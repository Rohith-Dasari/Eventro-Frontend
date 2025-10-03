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

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent 
    
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'events', component: EventsComponent },
      { path: 'events/:id', component: EventDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'artists', component: ArtistsComponent },
      { path: 'venues', component: VenuesComponent },          
      { path: '', redirectTo: 'events', pathMatch: 'full' } 
    ],
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
