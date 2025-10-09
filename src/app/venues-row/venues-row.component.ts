import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Venues } from '../models/venues';
import { VenueService } from '../services/venue.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-venues-row',
  imports: [CommonModule,CardModule,ToggleButtonModule,FormsModule],
  templateUrl: './venues-row.component.html',
  styleUrl: './venues-row.component.scss'
})
export class VenuesRowComponent {
  @Input() venues:Venues[]=[];

  @Output()moderateVenue=new EventEmitter();

  private venueService=inject(VenueService);
  loadingVenueId: string | null = null;

  onToggle(venue: Venues, event: Event) {
    // Prevent default toggle behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent multiple clicks
    if (this.loadingVenueId === venue.ID) {
      return;
    }
    
    this.loadingVenueId = venue.ID;
    const newStatus = !venue.IsBlocked;
    
    this.venueService.moderateVenue(venue.ID, newStatus).subscribe({
      next: (value) => {
        console.log('Venue moderated successfully:', value);
        this.loadingVenueId = null;
        // Let parent refresh handle updating the lists
        this.moderateVenue.emit();
      },
      error: (err) => {
        console.error('Error moderating venue:', err);
        this.loadingVenueId = null;
      }
    });
  }
}
