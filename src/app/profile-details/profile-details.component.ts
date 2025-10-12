import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserProfile } from '../models/user';

@Component({
  selector: 'app-profile-details',
  imports: [CommonModule, DialogModule, CardModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent implements OnChanges {
  @Input() userProfile!: UserProfile;
  @Input() visible = false; 
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  editedProfile: UserProfile | null = null;

  onVisibleChange(visible: boolean) {
    this.visible = visible;
    if (visible && this.userProfile) {
      this.editedProfile = {
        ...this.userProfile,
        PhoneNumber: this.userProfile.PhoneNumber ?? '',
      };
    }
    this.visibleChange.emit(visible);
  }

  closeDialog() {
    this.onVisibleChange(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userProfile'] && this.userProfile) {
      this.editedProfile = {
        ...this.userProfile,
        PhoneNumber: this.userProfile.PhoneNumber ?? '',
      };
    }
  }

  get isFormValid(): boolean {
    if (!this.editedProfile) return false;
    const usernameValid = this.editedProfile.Username.trim().length > 0;
    const phoneValue = this.editedProfile.PhoneNumber?.trim() ?? '';
    const phoneValid = phoneValue.length > 0;
    return usernameValid && phoneValid;
  }

  get hasChanges(): boolean {
    if (!this.userProfile || !this.editedProfile) return false;
    const originalUsername = this.userProfile.Username?.trim() ?? '';
    const currentUsername = this.editedProfile.Username?.trim() ?? '';
    const originalPhone = this.userProfile.PhoneNumber?.trim() ?? '';
    const currentPhone = this.editedProfile.PhoneNumber?.trim() ?? '';

    return (
      originalUsername !== currentUsername ||
      originalPhone !== currentPhone
    );
  }

  onSubmit() {
    if (!this.editedProfile || !this.isFormValid || !this.hasChanges) {
      return;
    }
    const trimmedUsername = this.editedProfile.Username.trim();
    const trimmedPhone = this.editedProfile.PhoneNumber.trim();

    const payload: UserProfile = {
      ...this.userProfile,
      Username: trimmedUsername,
      PhoneNumber: trimmedPhone,
    };

    this.profileUpdated.emit(payload);
    this.closeDialog();
  }

  onCancel() {
    this.closeDialog();
  }
}
