import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MenubarModule } from 'primeng/menubar';
import { filter } from 'rxjs/operators';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, MenubarModule,SearchBarComponent]
})

export class DashboardLayoutComponent {
 username = '';
  role = '';
  searchQuery = '';
  selectedLocation: any = null;
  currentRoute = '';

  locations = [
    { label: 'Noida', value: 'noida' },
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Mumbai', value: 'mumbai' },
  ];

  navItems: NavItem[] = [];

  constructor(private auth: AuthService, private router: Router, private locationService: LocationService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit() {
    const user = this.auth.userSignal();

    if (user) {
      this.username = user.email;
      this.role = (user.role || '').toLowerCase();
    } else {
      this.role = 'customer'; 
    }

    this.selectedLocation = this.locations[0];
    this.locationService.setCity(this.selectedLocation?.value);
    this.setNavItems();
    
    this.currentRoute = this.router.url;
  }

  setNavItems() {
    switch (this.role) {
      case 'customer':
        this.navItems = [
          { label: 'Events', path: '/dashboard/events' },       
          { label: 'Profile', path: '/dashboard/profile' },
        ];
        break;

      case 'host':
        this.navItems = [          
          { label: 'Events', path: '/dashboard/events' },
          { label: 'Venues', path: '/dashboard/venues' },
          { label: 'Profile', path: '/dashboard/profile' },
        ];
        break;

      case 'admin':
        this.navItems = [
          { label: 'Events', path: '/dashboard/events' },
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

  goToEvents(event?: Event) {
    event?.preventDefault();
    this.router.navigate(['/dashboard/events']);
  }

  onLocationChange(location: { label: string; value: string } | null) {
    this.locationService.setCity(location?.value);
  }


  isProfileSectionActive(): boolean {
    return this.currentRoute.includes('/dashboard/profile') || 
           this.currentRoute.includes('/dashboard/bookings');
  }

  isRouteActive(path: string): boolean {
    if (path === '/dashboard/profile') {
      return this.isProfileSectionActive();
    }
    return (
      this.currentRoute === path ||
      this.currentRoute.startsWith(path + '/')
    );
  }
}

interface NavItem {
  label: string;
  path: string;
}