import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Venues } from '../models/venues';
import { VenueService } from '../services/venue.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-venues-row',
  imports: [CommonModule,CardModule,ToggleButtonModule,FormsModule],
  templateUrl: './venues-row.component.html',
  styleUrl: './venues-row.component.scss'
})
export class VenuesRowComponent {
  @Input() venues: Venues[] = [];
  @Output() moderateVenue = new EventEmitter<void>(); 
  
  private venueService = inject(VenueService);
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
        this.loadingVenueId = null;
        this.moderateVenue.emit(); 
      },
      error: (err) => {
        console.error('Error moderating venue:', err);
        venue.IsBlocked = previousStatus;
        this.loadingVenueId = null;
      }
    });
  }
}