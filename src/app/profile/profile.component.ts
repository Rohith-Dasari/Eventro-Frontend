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

  showDetailsDialog = false;
  upcomingCount = 2;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.user.user_id;
    this.userService.getProfile(userId).subscribe({
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
