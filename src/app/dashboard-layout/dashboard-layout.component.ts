import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  imports:[RouterOutlet]
})
export class DashboardLayoutComponent {
  username = '';

  constructor(private auth: AuthService, private router: Router) {
    this.username = (this.auth.userSignal()?.email as string); 
  }

}
