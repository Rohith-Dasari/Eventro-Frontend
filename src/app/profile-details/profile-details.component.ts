import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() visibleChange = new EventEmitter<boolean>();

  onVisibleChange(visible: boolean) {
    this.visible = visible;
    this.visibleChange.emit(visible);
  }

  closeDialog() {
    this.onVisibleChange(false);
  }
}
