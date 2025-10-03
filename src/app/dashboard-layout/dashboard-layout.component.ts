import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  imports: [RouterOutlet, CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, MenubarModule]
})
export class DashboardLayoutComponent {
  username = '';
  searchQuery = '';
  selectedLocation: any = null;
  
  locations = [
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Mumbai', value: 'mumbai' }
  ];

  constructor(private auth: AuthService, private router: Router) {
    this.username = (this.auth.userSignal()?.email as string);
    this.selectedLocation = this.locations[0]; // Default to Hyderabad
  }

  onLogout(){
    this.auth.logout();
    this.router.navigate(['/login'])
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality
    }
  }

}
