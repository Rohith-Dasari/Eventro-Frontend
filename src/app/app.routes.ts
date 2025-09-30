import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { EventsComponent } from './events/events.component';
import { ProfileComponent } from './profile/profile.component';

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
    children: [
      { path: 'events', component: EventsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'events', pathMatch: 'full' } 
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
