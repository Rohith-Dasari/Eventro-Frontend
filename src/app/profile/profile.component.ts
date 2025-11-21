import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [ProfileDetailsComponent],
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  user = this.authService.userSignal() as User;
  userProfile!: UserProfile;
  role = this.user?.role || this.authService.getRole();

  showDetailsDialog = false;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const email = this.user?.email || localStorage.getItem('user_email');
    if (!email) {
      console.error('Error loading profile: missing user email');
      return;
    }

    this.userService.getProfile(email).subscribe({
      next: (profile) => (this.userProfile = profile as UserProfile),
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  navigateTo(section: string) {
    if (section === 'bookings') {
      this.router.navigate(['/dashboard/bookings']);
    }
  }
}
