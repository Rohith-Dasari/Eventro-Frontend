import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserProfile } from '../models/user';
import { UserService } from '../services/user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile-details',
  imports: [
    CommonModule,
    DialogModule,
    CardModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent implements OnChanges {
  @Input() userProfile!: UserProfile;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  private userService = inject(UserService);
  private messageService=inject(MessageService);
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
      originalUsername !== currentUsername || originalPhone !== currentPhone
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

    this.userService.updateProfile(this.userProfile.UserID, payload).subscribe({
      next: (res) => {
        console.log('profile updated successfully:', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Show Added',
          detail: 'Your show has been scheduled successfully.',
          life: 3000,
        });
        this.profileUpdated.emit(payload);
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error updating profiel:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Updation Failed',
          detail: 'Error updating profile. Please try again.',
          life: 3000,
        });
      },
    });
  }

  onCancel() {
    this.closeDialog();
  }
}
