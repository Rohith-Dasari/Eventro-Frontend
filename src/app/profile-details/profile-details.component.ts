import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { UserProfile } from '../models/user';

@Component({
  selector: 'app-profile-details',
  imports: [CommonModule, DialogModule, CardModule],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})

export class ProfileDetailsComponent {
  @Input() userProfile!: UserProfile;
  @Input() visible = false; 

  closeDialog() {
    this.visible = false;
  }
}
