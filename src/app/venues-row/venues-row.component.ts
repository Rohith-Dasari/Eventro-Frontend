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

  onToggle(venue: Venues) {
    const newStatus = !venue.IsBlocked;
    
    this.venueService.moderateVenue(venue.ID, newStatus).subscribe({
      next: (value) => {
        console.log('Venue moderated successfully:', value);
        // Don't modify local state - let parent refresh handle it
        this.moderateVenue.emit();
      },
      error: (err) => {
        console.error('Error moderating venue:', err);
      }
    });
  }
}
