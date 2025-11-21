import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Venues } from '../models/venues';
import { VenueService } from '../services/venue.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-venues-row',
  imports: [CommonModule,CardModule,ToggleButtonModule,FormsModule,SpinnerComponent],
  templateUrl: './venues-row.component.html',
  styleUrl: './venues-row.component.scss'
})
export class VenuesRowComponent {
  @Input() venues: Venues[] = [];
  @Output() moderateVenue = new EventEmitter<void>(); 
  
  private venueService = inject(VenueService);
  private messageService = inject(MessageService);
  loadingVenueId: string | null = null;
  
  onToggle(venue: Venues, event: Event) {    
    if (this.loadingVenueId === venue.ID) {
      return;
    }
    
    const previousStatus = venue.IsBlocked;
    venue.IsBlocked = !previousStatus;
    
    this.loadingVenueId = venue.ID;
    
    this.venueService.moderateVenue(venue.ID, venue.IsBlocked).subscribe({
      next: () => {
        console.log('Venue moderated successfully');
        this.messageService.add({
          severity: 'success',
          summary: venue.IsBlocked ? 'Venue Blocked' : 'Venue Unblocked',
          detail: `${venue.Name} is now ${venue.IsBlocked ? 'blocked' : 'active'}.`,
          life: 3000,
        });
        this.loadingVenueId = null;
        this.moderateVenue.emit(); 
      },
      error: (err) => {
        console.error('Error moderating venue:', err);
        venue.IsBlocked = previousStatus;
        this.messageService.add({
          severity: 'error',
          summary: 'Moderation Failed',
          detail: 'We could not update the venue status. Please try again.',
          life: 3000,
        });
        this.loadingVenueId = null;
      }
    });
  }
}