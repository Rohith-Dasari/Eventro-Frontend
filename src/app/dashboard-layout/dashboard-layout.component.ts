import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, MenubarModule]
})

export class DashboardLayoutComponent {
 username = '';
  role = '';
  searchQuery = '';
  selectedLocation: any = null;

  locations = [
    { label: 'Noida', value: 'noida' },
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Mumbai', value: 'mumbai' },
  ];

  navItems: NavItem[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.userSignal();

    if (user) {
      this.username = user.email;
      this.role = user.role;
    } else {
      this.role = 'Customer'; 
    }

    this.selectedLocation = this.locations[0];
    this.setNavItems();
  }

  setNavItems() {
    switch (this.role) {
      case 'Customer':
        this.navItems = [
          { label: 'Events', path: '/dashboard/events' },       
          { label: 'Profile', path: '/dashboard/profile' },
        ];
        break;

      case 'Host':
        this.navItems = [
          { label: 'Shows', path: '/dashboard/shows' },
          { label: 'Venues', path: '/dashboard/venues' },
          { label: 'Profile', path: '/dashboard/profile' },
        ];
        break;

      case 'Admin':
        this.navItems = [
          { label: 'Events', path: '/dashboard/events' },
          { label: 'Venues', path: '/dashboard/venues' },
          { label: 'Artists', path: '/dashboard/artists' },
          { label: 'Profile', path: '/dashboard/profile' },
        ];
        break;

      default:
        this.navItems = [{ label: 'Profile', path: '/dashboard/profile' }];
    }
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/dashboard/events'], {
        queryParams: { q: this.searchQuery, location: this.selectedLocation?.value },
      });
    }
  }
}

interface NavItem {
  label: string;
  path: string;
}