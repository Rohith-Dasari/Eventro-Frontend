import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private authService=inject(AuthService);
  user_id=(this.authService.userSignal() as User).user_id;
  private router = inject(Router);

  user = this.authService.userSignal() as User;
  upcomingCount = 2; 

  navigateTo(section: string) {
    console.log('profile stage: navigation requested for section:', section);
    if (section === 'bookings') {
      console.log('profile stage: navigating to bookings list at /dashboard/bookings');
      this.router.navigate(['/dashboard/bookings']);
    } else {
      console.log('profile stage: navigating to other section:', `/profile/${section}`);
      this.router.navigate([`/profile/${section}`]);
    }
  }

}
